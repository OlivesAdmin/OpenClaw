/**
 * PDF bank statement parser for Singapore banks (DBS, OCBC, UOB, Citi, AMEX, StanChart).
 */

import type { CreditCardExpense } from "./types";
import { categorizeExpense } from "./utils";

// ─── PDF.js dynamic import ────────────────────────────────────────────────────

async function getPdfLib() {
  const pdfjsLib = await import("pdfjs-dist");
  if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
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

  // DD/MM/YYYY or DD-MM-YYYY
  let m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;

  // YYYY-MM-DD
  m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return raw;

  // DD MMM YYYY or DD MMM YY (e.g. "12 Mar 2026" / "12 Mar 26")
  m = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/);
  if (m) {
    const mo = MONTH_MAP[m[2].toLowerCase()];
    if (mo) {
      const yr = m[3].length === 2 ? `20${m[3]}` : m[3];
      return `${yr}-${mo}-${m[1].padStart(2, "0")}`;
    }
  }

  // DD MMM (no year, e.g. DBS "12 Mar")
  m = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,9})$/);
  if (m) {
    const mo = MONTH_MAP[m[2].toLowerCase()];
    if (mo) {
      const yr = new Date().getFullYear();
      return `${yr}-${mo}-${m[1].padStart(2, "0")}`;
    }
  }

  // MMM DD YYYY (e.g. "Mar 12 2026")
  m = raw.match(/^([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})$/);
  if (m) {
    const mo = MONTH_MAP[m[1].toLowerCase()];
    if (mo) return `${m[3]}-${mo}-${m[2].padStart(2, "0")}`;
  }

  // MM/DD (Citi – no year)
  m = raw.match(/^(\d{2})\/(\d{2})$/);
  if (m) {
    const yr = new Date().getFullYear();
    return `${yr}-${m[1]}-${m[2]}`;
  }

  return raw;
}

function looksLikeDate(s: string): boolean {
  s = s.trim();
  return (
    /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(s) ||
    /^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}$/.test(s) ||
    /^\d{1,2}\s+[A-Za-z]{3,9}$/.test(s) ||
    /^[A-Za-z]{3,9}\s+\d{1,2}\s+\d{4}$/.test(s) ||
    /^\d{2}\/\d{2}$/.test(s)
  );
}

// ─── Amount helpers ────────────────────────────────────────────────────────────

function toAmount(s: string): number {
  return parseFloat(s.replace(/,/g, "")) || 0;
}

// Amount anywhere in the string (not just at end)
const AMOUNT_RE = /\b(\d{1,3}(?:,\d{3})*\.\d{2})\b/g;
const CREDIT_MARKER = /\b(CR|Credit|Cr\.)\b/i;

// Lines that are payments/credits to the card — not real expenses
const PAYMENT_LINE = /\b(incoming\s*payment|payment\s*received|payment\s*thank\s*you|thank\s*you\s*for\s*payment|prev(?:ious)?\s*balance|opening\s*balance|closing\s*balance|balance\s*[bc]\/?[fb]|balance\s*brought|balance\s*carried|minimum\s*payment|auto[\s-]?pay|refund|reversal|cashback|rebate|reward|interest\s*charge|finance\s*charge|late\s*charge|annual\s*fee|cash\s*advance\s*fee)\b/i;

function cleanDescription(desc: string): string {
  return desc
    .replace(/[{}\[\]<>|\\^~`]+/g, "")   // remove stray punctuation / brace artifacts
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ─── Text extraction ──────────────────────────────────────────────────────────

interface RawItem {
  x: number;
  y: number;
  str: string;
}

async function extractPageLines(file: File): Promise<string[][]> {
  const pdfjsLib = await getPdfLib();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: buffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  const allPageLines: string[][] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent({ includeMarkedContent: false });

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

    // Group items into rows by y-coordinate (8px bucket)
    const BUCKET = 8;
    const rowMap = new Map<number, RawItem[]>();
    for (const item of items) {
      const bucket = Math.round(item.y / BUCKET) * BUCKET;
      if (!rowMap.has(bucket)) rowMap.set(bucket, []);
      rowMap.get(bucket)!.push(item);
    }

    // Sort rows top-to-bottom (PDF y=0 at bottom → descending = top first)
    const sortedBuckets = Array.from(rowMap.keys()).sort((a, b) => b - a);

    const pageLines: string[] = [];
    for (const bucket of sortedBuckets) {
      const rowItems = rowMap.get(bucket)!.sort((a, b) => a.x - b.x);
      let line = rowItems[0].str;
      for (let i = 1; i < rowItems.length; i++) {
        const prevEnd = rowItems[i - 1].x + rowItems[i - 1].str.length * 5;
        const gap = rowItems[i].x - prevEnd;
        line += (gap > 6 ? "  " : "") + rowItems[i].str;
      }
      const cleaned = line.replace(/\s{3,}/g, "  ").trim();
      if (cleaned) pageLines.push(cleaned);
    }

    allPageLines.push(pageLines);
  }

  return allPageLines;
}

// ─── Transaction parser ────────────────────────────────────────────────────────

const DATE_PREFIX_PATTERNS = [
  /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s+/,          // DD/MM/YYYY
  /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2})\s+/,           // DD/MM/YY
  /^(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})\s+/,         // DD Mon YYYY / DD Mon YY
  /^(\d{1,2}\s+[A-Za-z]{3,9})\s{2,}/,                 // DD Mon (no year) — needs 2+ spaces
  /^([A-Za-z]{3,9}\s+\d{1,2}[,\s]+\d{4})\s+/,        // Mon DD YYYY
  /^(\d{2}\/\d{2})\s+/,                               // MM/DD
];

function parseTransactions(lines: string[], cardName: string): CreditCardExpense[] {
  // Log first 30 lines for debugging
  console.log("[parsePDF] sample lines:", lines.slice(0, 30));

  const results: CreditCardExpense[] = [];
  const seen = new Set<string>();

  function addResult(date: string, description: string, amount: number) {
    const desc = cleanDescription(description);
    if (amount <= 0 || !desc || desc.length < 2) return;
    if (PAYMENT_LINE.test(desc)) return;          // skip payments/credits to card
    if (CREDIT_MARKER.test(desc)) return;
    const key = `${date}|${desc}|${amount}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push({
      id: `${cardName}-pdf-${Date.now()}-${results.length}`,
      date: toISODate(date),
      description: desc,
      amount,
      category: categorizeExpense(desc),
      cardName,
    });
  }

  // ── Pass A: date prefix on same line as description + amount ──────────────
  for (const line of lines) {
    if (CREDIT_MARKER.test(line)) continue;
    if (PAYMENT_LINE.test(line)) continue;

    for (const pat of DATE_PREFIX_PATTERNS) {
      const dm = line.match(pat);
      if (!dm) continue;

      const rest = line.slice(dm[0].length).trim();
      if (!rest) break;
      if (CREDIT_MARKER.test(rest)) break;

      // Find all amounts in the rest; use the LAST one as the transaction amount
      const amounts = [...rest.matchAll(AMOUNT_RE)];
      if (amounts.length === 0) break;

      const lastAmt = amounts[amounts.length - 1];
      const amount = toAmount(lastAmt[1]);
      const descEnd = rest.lastIndexOf(lastAmt[1]);
      const description = rest
        .slice(0, descEnd)
        .replace(/[-–—|]+\s*$/, "")
        .trim();

      addResult(dm[1], description || rest.slice(0, 30), amount);
      break;
    }
  }

  console.log("[parsePDF] Pass A found:", results.length, "transactions");

  // ── Pass B: date on its own line, description + amount on next line ─────────
  if (results.length === 0) {
    for (let i = 0; i < lines.length - 1; i++) {
      const trimmed = lines[i].trim();
      if (!looksLikeDate(trimmed)) continue;

      const nextLine = lines[i + 1];
      if (CREDIT_MARKER.test(nextLine)) continue;
      if (PAYMENT_LINE.test(nextLine)) continue;

      const amounts = [...nextLine.matchAll(AMOUNT_RE)];
      if (amounts.length === 0) continue;

      const lastAmt = amounts[amounts.length - 1];
      const amount = toAmount(lastAmt[1]);
      const descEnd = nextLine.lastIndexOf(lastAmt[1]);
      const description = nextLine.slice(0, descEnd).replace(/[-–—|]+\s*$/, "").trim();

      addResult(trimmed, description || nextLine.slice(0, 30), amount);
      i++;
    }
    console.log("[parsePDF] Pass B found:", results.length, "transactions");
  }

  // ── Pass C: looser scan — any line with a date-like token and an amount ─────
  if (results.length === 0) {
    const DATE_ANYWHERE = [
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/,
      /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/i,
      /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)\b/i,
      /\b(\d{2}\/\d{2})\b/,
    ];

    for (const line of lines) {
      if (CREDIT_MARKER.test(line)) continue;
      if (PAYMENT_LINE.test(line)) continue;
      const amounts = [...line.matchAll(AMOUNT_RE)];
      if (amounts.length === 0) continue;

      for (const datePat of DATE_ANYWHERE) {
        const dm = line.match(datePat);
        if (!dm) continue;

        const lastAmt = amounts[amounts.length - 1];
        const amount = toAmount(lastAmt[1]);
        // Description = everything between date match end and amount start
        const afterDate = line.slice(dm.index! + dm[0].length);
        const descEnd = afterDate.lastIndexOf(lastAmt[1]);
        const description = afterDate.slice(0, descEnd < 0 ? undefined : descEnd)
          .replace(/[-–—|]+/g, " ").trim();

        addResult(dm[1], description || line.slice(0, 40), amount);
        break;
      }
    }
    console.log("[parsePDF] Pass C found:", results.length, "transactions");
  }

  return results;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function parsePDFToExpenses(
  file: File,
  cardName: string
): Promise<CreditCardExpense[]> {
  const pageLines = await extractPageLines(file);
  console.log("[parsePDF] pages:", pageLines.length, "| total lines:", pageLines.flat().length);
  const allLines = pageLines.flat();
  return parseTransactions(allLines, cardName);
}
