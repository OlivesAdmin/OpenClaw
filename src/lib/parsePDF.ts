/**
 * PDF bank statement parser for Singapore banks (DBS, OCBC, UOB, Citi, AMEX, StanChart).
 *
 * Strategy:
 *  1. Extract text items with their x/y positions from each page.
 *  2. Reconstruct rows by snapping items to y-buckets.
 *  3. Try to parse each row as a transaction (date + description + debit amount).
 *  4. Fall back to a raw line-regex pass if position-based pass yields nothing.
 */

import type { CreditCardExpense } from "./types";
import { categorizeExpense } from "./utils";

// ─── PDF.js dynamic import ────────────────────────────────────────────────────

async function getPdfLib() {
  const pdfjsLib = await import("pdfjs-dist");

  if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // Try CDN first; if that fails the library falls back to a fake worker.
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    } catch {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "";
    }
  }

  return pdfjsLib;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  january: "01", february: "02", march: "03", april: "04", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
};

function toISODate(raw: string): string {
  raw = raw.trim();

  // DD/MM/YYYY  or  DD-MM-YYYY
  let m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;

  // YYYY-MM-DD (already ISO)
  m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return raw;

  // DD MMM YYYY  or  DD MMM YY  (e.g. "12 Mar 2026" / "12 Mar 26")
  m = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/);
  if (m) {
    const mo = MONTH_MAP[m[2].toLowerCase()];
    if (mo) {
      const yr = m[3].length === 2 ? `20${m[3]}` : m[3];
      return `${yr}-${mo}-${m[1].padStart(2, "0")}`;
    }
  }

  // MMM DD YYYY  (e.g. "Mar 12 2026")
  m = raw.match(/^([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})$/);
  if (m) {
    const mo = MONTH_MAP[m[1].toLowerCase()];
    if (mo) return `${m[3]}-${mo}-${m[2].padStart(2, "0")}`;
  }

  // MM/DD  (Citi – no year, assume current year)
  m = raw.match(/^(\d{2})\/(\d{2})$/);
  if (m) {
    const yr = new Date().getFullYear();
    return `${yr}-${m[1]}-${m[2]}`;
  }

  return raw; // best-effort
}

function looksLikeDate(s: string): boolean {
  s = s.trim();
  return (
    /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(s) ||
    /^\d{1,2}\s+[A-Za-z]{3,}\s+\d{2,4}$/.test(s) ||
    /^[A-Za-z]{3,}\s+\d{1,2}\s+\d{4}$/.test(s) ||
    /^\d{2}\/\d{2}$/.test(s)
  );
}

// ─── Amount helpers ────────────────────────────────────────────────────────────

/** Parse "1,234.56" → 1234.56 */
function toAmount(s: string): number {
  return parseFloat(s.replace(/,/g, "")) || 0;
}

/** Match a debit amount at the end of a string.
 *  Ignores trailing CR (credit) markers — we only want debits. */
const DEBIT_AT_END = /(\d{1,3}(?:,\d{3})*\.\d{2})\s*(?:DR|Debit)?\s*$/i;
const CREDIT_MARKER = /\b(CR|Credit|Cr\.)\b/i;

// ─── Text extraction ──────────────────────────────────────────────────────────

interface RawItem {
  x: number;
  y: number;
  str: string;
}

async function extractPageLines(file: File): Promise<string[][]> {
  const pdfjsLib = await getPdfLib();
  const buffer   = await file.arrayBuffer();
  const pdf      = await pdfjsLib.getDocument({
    data: buffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  const allPageLines: string[][] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page    = await pdf.getPage(p);
    const content = await page.getTextContent({ includeMarkedContent: false });

    // Collect positioned items
    const items: RawItem[] = [];
    for (const raw of content.items) {
      if (!("str" in raw)) continue;
      const str = (raw as { str: string }).str;
      if (!str.trim()) continue;
      const t = (raw as { transform: number[] }).transform;
      items.push({ x: t[4], y: t[5], str });
    }

    if (items.length === 0) {
      allPageLines.push([]);
      continue;
    }

    // Snap y values into buckets so items on the same visual row merge.
    // Use a generous 6-pixel tolerance to absorb baseline shifts.
    const BUCKET = 6;
    const rowMap = new Map<number, RawItem[]>();

    for (const item of items) {
      const bucket = Math.round(item.y / BUCKET) * BUCKET;
      if (!rowMap.has(bucket)) rowMap.set(bucket, []);
      rowMap.get(bucket)!.push(item);
    }

    // Sort rows top-to-bottom (PDF y = 0 at bottom, so descending = top-first)
    const sortedBuckets = Array.from(rowMap.keys()).sort((a, b) => b - a);

    const pageLines: string[] = [];
    for (const bucket of sortedBuckets) {
      const rowItems = rowMap.get(bucket)!.sort((a, b) => a.x - b.x);
      // Concatenate, inserting a space when x-gap > 8px between items
      let line = rowItems[0].str;
      for (let i = 1; i < rowItems.length; i++) {
        const gap = rowItems[i].x - (rowItems[i - 1].x + rowItems[i - 1].str.length * 5);
        line += (gap > 8 ? "  " : "") + rowItems[i].str;
      }
      const cleaned = line.replace(/\s{3,}/g, "  ").trim();
      if (cleaned) pageLines.push(cleaned);
    }

    allPageLines.push(pageLines);
  }

  return allPageLines;
}

// ─── Transaction parser ────────────────────────────────────────────────────────

/**
 * Many SG bank statements have one of these two structures:
 *
 *  A) Date and amount on the SAME line:
 *     "12 Mar 2026  GRAB SG  -  120.50"
 *
 *  B) Date on its OWN line, description + amount on the NEXT line:
 *     "12 Mar 2026"
 *     "GRAB SG PAYMENT  120.50"
 */
function parseTransactions(lines: string[], cardName: string): CreditCardExpense[] {
  const results: CreditCardExpense[] = [];

  // ── Pattern A: date + description + amount on one line ──────────────────────
  // Try multi-word date patterns by looking for a DATE prefix on each line.
  const DATE_PREFIX = [
    /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s{1,4}/,        // DD/MM/YYYY or DD-MM-YYYY
    /^(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})\s{1,4}/,       // DD Mon YYYY / DD Mon YY
    /^([A-Za-z]{3,9}\s+\d{1,2}[,\s]+\d{4})\s{1,4}/,      // Mon DD, YYYY
    /^(\d{2}\/\d{2})\s{1,4}/,                              // MM/DD (Citi)
  ];

  const singleLineResults: CreditCardExpense[] = [];
  for (const line of lines) {
    for (const pat of DATE_PREFIX) {
      const dm = line.match(pat);
      if (!dm) continue;

      const rest = line.slice(dm[0].length);

      // Skip lines that are pure credit
      if (CREDIT_MARKER.test(rest)) break;

      const am = rest.match(DEBIT_AT_END);
      if (!am) break;

      const amount = toAmount(am[1]);
      if (amount <= 0) break;

      const description = rest
        .slice(0, rest.lastIndexOf(am[1]))
        .replace(/[-–—|]+\s*$/, "")
        .trim();

      if (!description || description.length < 2) break;

      singleLineResults.push({
        id: `${cardName}-pdf-${Date.now()}-${singleLineResults.length}`,
        date: toISODate(dm[1]),
        description,
        amount,
        category: categorizeExpense(description),
        cardName,
      });
      break;
    }
  }

  if (singleLineResults.length > 0) {
    results.push(...singleLineResults);
  }

  // ── Pattern B: date on one line, next line has description + amount ──────────
  if (results.length === 0) {
    for (let i = 0; i < lines.length - 1; i++) {
      if (!looksLikeDate(lines[i].trim())) continue;
      const nextLine = lines[i + 1];
      if (CREDIT_MARKER.test(nextLine)) continue;
      const am = nextLine.match(DEBIT_AT_END);
      if (!am) continue;
      const amount = toAmount(am[1]);
      if (amount <= 0) continue;
      const description = nextLine.slice(0, nextLine.lastIndexOf(am[1])).trim();
      if (!description) continue;
      results.push({
        id: `${cardName}-pdf-${Date.now()}-${results.length}`,
        date: toISODate(lines[i].trim()),
        description,
        amount,
        category: categorizeExpense(description),
        cardName,
      });
      i++; // skip the consumed next line
    }
  }

  return results;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function parsePDFToExpenses(
  file: File,
  cardName: string
): Promise<CreditCardExpense[]> {
  const pageLines = await extractPageLines(file);
  const allLines  = pageLines.flat();

  const expenses = parseTransactions(allLines, cardName);

  // De-duplicate (some PDFs repeat pages or running totals)
  const seen = new Set<string>();
  return expenses.filter((e) => {
    const key = `${e.date}|${e.description}|${e.amount}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
