import * as pdfjsLib from "pdfjs-dist";
import { CreditCardExpense } from "./types";
import { categorizeExpense } from "./utils";

// Use CDN worker for pdfjs-dist v5
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

// ─── Date normalisation ───────────────────────────────────────────────────────

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function normaliseDate(raw: string): string {
  raw = raw.trim();

  // DD/MM/YYYY or DD-MM-YYYY
  let m = raw.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  // DD MMM YYYY  or  DD MMM YY
  m = raw.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{2,4})$/);
  if (m) {
    const mo = MONTHS[m[2].toLowerCase()] || "01";
    const yr = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${yr}-${mo}-${m[1].padStart(2, "0")}`;
  }

  // MM/DD  (Citi, no year → use current year)
  m = raw.match(/^(\d{2})\/(\d{2})$/);
  if (m) return `${new Date().getFullYear()}-${m[1]}-${m[2]}`;

  return raw;
}

// ─── Amount parsing ───────────────────────────────────────────────────────────

function parseAmount(s: string): number {
  return parseFloat(s.replace(/,/g, "")) || 0;
}

// ─── Text extraction from PDF ─────────────────────────────────────────────────

interface TextItem {
  x: number;
  y: number;
  str: string;
}

async function extractLines(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer, useWorkerFetch: false, isEvalSupported: false }).promise;

  const allLines: string[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();

    // Group text items by rounded y-coordinate (each row ≈ same y)
    const rowMap = new Map<number, TextItem[]>();
    for (const raw of content.items) {
      if (!("str" in raw) || !raw.str.trim()) continue;
      const transform = (raw as { transform: number[] }).transform;
      const x = Math.round(transform[4]);
      const y = Math.round(transform[5]);

      // Snap to nearest 4px bucket so minor y-jitter doesn't split rows
      const bucket = Math.round(y / 4) * 4;
      if (!rowMap.has(bucket)) rowMap.set(bucket, []);
      rowMap.get(bucket)!.push({ x, y, str: raw.str });
    }

    // Sort rows top-to-bottom (PDF y is bottom-up, so descending y = top)
    const sortedBuckets = Array.from(rowMap.keys()).sort((a, b) => b - a);

    for (const bucket of sortedBuckets) {
      const items = rowMap.get(bucket)!.sort((a, b) => a.x - b.x);
      const line = items.map((i) => i.str).join(" ").replace(/\s{2,}/g, " ").trim();
      if (line) allLines.push(line);
    }
  }

  return allLines;
}

// ─── Transaction pattern matching ─────────────────────────────────────────────
//
// We look for lines that START with a recognisable date and END with a dollar
// amount.  Everything in between is the description.
// We skip amounts labelled "CR" (credits/refunds) unless the user's balance
// shows them as money out.

// Date patterns (anchored at start of trimmed line)
const DATE_PATTERNS = [
  /^(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+/,          // DD/MM/YYYY
  /^(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s+/,         // DD Mon YYYY
  /^(\d{1,2}\s+[A-Za-z]{3}\s+\d{2})(?=\s)/,      // DD Mon YY  (OCBC)
  /^(\d{2}\/\d{2})(?=\s)/,                         // MM/DD (Citi)
];

// Amount at end of line — optional trailing CR/DR tag
const AMOUNT_AT_END = /(\d{1,3}(?:,\d{3})*\.\d{2})\s*(?:CR|Dr|DR)?\s*$/i;

function parseLines(lines: string[], cardName: string): CreditCardExpense[] {
  const results: CreditCardExpense[] = [];

  for (const line of lines) {
    let rest = line.trim();
    let rawDate = "";

    // Try to strip date from beginning
    for (const pat of DATE_PATTERNS) {
      const m = rest.match(pat);
      if (m) {
        rawDate = m[1];
        rest = rest.slice(m[0].length).trim();
        break;
      }
    }
    if (!rawDate) continue;

    // Try to strip amount from end
    const amtMatch = rest.match(AMOUNT_AT_END);
    if (!amtMatch) continue;

    // Skip lines tagged as credits (CR = money coming in, not an expense)
    if (/\bCR\b/i.test(rest.slice(rest.lastIndexOf(amtMatch[1])))) continue;

    const amount = parseAmount(amtMatch[1]);
    if (amount <= 0) continue;

    const description = rest
      .slice(0, rest.lastIndexOf(amtMatch[1]))
      .replace(/[-–—]\s*$/, "")
      .trim();

    if (!description) continue;

    results.push({
      id: `${cardName}-pdf-${Date.now()}-${results.length}`,
      date: normaliseDate(rawDate),
      description,
      amount,
      category: categorizeExpense(description),
      cardName,
    });
  }

  return results;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function parsePDFToExpenses(
  file: File,
  cardName: string
): Promise<CreditCardExpense[]> {
  const lines = await extractLines(file);
  const expenses = parseLines(lines, cardName);

  // De-duplicate by amount+description (some PDFs duplicate pages)
  const seen = new Set<string>();
  return expenses.filter((e) => {
    const key = `${e.date}|${e.description}|${e.amount}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
