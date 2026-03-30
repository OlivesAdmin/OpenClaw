"use client";

import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud, FileText, FileSpreadsheet, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { Statement } from "@/lib/types";
import { parseCSVToExpenses } from "@/lib/utils";
import { parsePDFToExpenses } from "@/lib/parsePDF";
import { useTheme, useBreakpoint } from "@/lib/theme";

interface StatementUploadProps {
  onUpload: (statement: Statement) => void;
}

export default function StatementUpload({ onUpload }: StatementUploadProps) {
  const { theme, t } = useTheme();
  const isMobile = useBreakpoint() === "mobile";
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [cardName, setCardName] = useState("Citi PremierMiles");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState("");
  const [lastCount, setLastCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      const isCSV = file.name.toLowerCase().endsWith(".csv");
      const isPDF = file.name.toLowerCase().endsWith(".pdf");

      if (!isCSV && !isPDF) {
        setError("Please upload a PDF or CSV file");
        return;
      }

      setUploading(true);
      setError("");
      setLastCount(null);
      setProgress(isPDF ? "Reading PDF…" : "Parsing CSV…");

      try {
        let expenses;

        if (isPDF) {
          setProgress("Extracting text from PDF…");
          expenses = await parsePDFToExpenses(file, cardName);
          setProgress("Matching transactions…");
        } else {
          // CSV path
          expenses = await new Promise<ReturnType<typeof parseCSVToExpenses>>(
            (resolve, reject) => {
              Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                  try {
                    resolve(parseCSVToExpenses(results.data as Record<string, string>[], cardName));
                  } catch (e) {
                    reject(e);
                  }
                },
                error: reject,
              });
            }
          );
        }

        if (expenses.length === 0) {
          setError(
            isPDF
              ? "No transactions found in this PDF. Make sure it's a bank statement and the card bank is selected correctly."
              : "No valid expense rows found. Check CSV format."
          );
          setUploading(false);
          setProgress("");
          return;
        }

        const statement: Statement = {
          id: `${cardName}-${month}-${Date.now()}`,
          filename: file.name,
          uploadDate: new Date().toISOString(),
          cardName,
          month,
          expenses,
          total: expenses.reduce((s, e) => s + e.amount, 0),
        };
        onUpload(statement);
        setLastCount(expenses.length);
        setUploading(false);
        setProgress("");
      } catch (err) {
        setError(`Failed to parse file: ${err instanceof Error ? err.message : "Unknown error"}`);
        setUploading(false);
        setProgress("");
      }
    },
    [cardName, month, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const cardOptions = [
    "DBS Cashback", "DBS Altitude", "DBS Live Fresh",
    "OCBC 365", "OCBC Frank", "OCBC Titanium",
    "UOB One", "UOB Lady's", "UOB Absolute",
    "Citi PremierMiles", "Citi Cash Back",
    "AMEX True Cashback", "Standard Chartered",
  ];

  return (
    <div
      className="fade-in-up"
      style={{
        animationDelay: "0.05s", borderRadius: "24px", overflow: "hidden",
        background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow,
        backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", transition: "background 0.4s",
      }}
    >
      <div style={{ height: "4px", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", boxShadow: theme === "dark" ? "0 0 20px #6366f1cc" : "none" }} />

      <div style={{ padding: "22px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
          }}>
            <UploadCloud size={17} style={{ color: "#818cf8" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: t.text }}>Upload Statement</h2>
            <p style={{ fontSize: "11px", color: t.textDim, marginTop: "2px" }}>PDF or CSV from your bank</p>
          </div>
        </div>

        <div style={{ height: "1px", background: t.divider, marginBottom: "20px" }} />

        {/* Selectors */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.label, display: "block", marginBottom: "6px" }}>Card</label>
            <select
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", fontSize: "12px", borderRadius: "10px",
                background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textSecondary, outline: "none",
              }}
            >
              {cardOptions.map((opt) => (
                <option key={opt} value={opt} style={{ background: t.selectBg }}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.label, display: "block", marginBottom: "6px" }}>Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", fontSize: "12px", borderRadius: "10px",
                background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textSecondary,
                outline: "none", colorScheme: theme,
              }}
            />
          </div>
        </div>

        {/* Drop zone */}
        <div
          style={{
            border: `1.5px dashed ${isDragging ? "rgba(99,102,241,0.7)" : `rgba(99,102,241,${theme === "dark" ? "0.3" : "0.4"})`}`,
            borderRadius: "16px", padding: "24px 16px", textAlign: "center", cursor: "pointer",
            background: isDragging ? "rgba(99,102,241,0.07)" : "transparent", transition: "all 0.25s",
            marginBottom: "14px",
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.csv"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }}
          />

          {uploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ position: "relative", width: "40px", height: "40px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  border: "3px solid rgba(99,102,241,0.15)",
                  borderTopColor: "#6366f1",
                  animation: "spin 0.9s linear infinite",
                }} />
              </div>
              <div>
                <div style={{ fontSize: "13px", color: t.textSecondary, fontWeight: 600 }}>{progress}</div>
                <div style={{ fontSize: "11px", color: t.textDim, marginTop: "3px" }}>Please wait…</div>
              </div>
            </div>
          ) : lastCount !== null ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={28} style={{ color: "#34d399" }} />
              <div style={{ fontSize: "13px", color: "#34d399", fontWeight: 700 }}>{lastCount} transactions imported!</div>
              <div style={{ fontSize: "11px", color: t.textDim }}>Click to upload another</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              {/* PDF + CSV icons */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                }}>
                  <FileText size={20} style={{ color: "#f87171" }} />
                </div>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                }}>
                  <FileSpreadsheet size={20} style={{ color: "#4ade80" }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: t.textSecondary, fontWeight: 600 }}>
                  {isDragging ? "Drop to upload" : "Drop PDF or CSV · click to browse"}
                </div>
                <div style={{ fontSize: "11px", color: t.textDim, marginTop: "4px" }}>DBS · OCBC · UOB · Citi · AMEX</div>
              </div>

              {/* Format badges */}
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { label: "PDF", c: "#f87171", bg: "rgba(239,68,68,0.08)", b: "rgba(239,68,68,0.2)" },
                  { label: "CSV", c: "#4ade80", bg: "rgba(34,197,94,0.08)", b: "rgba(34,197,94,0.2)" },
                ].map((badge) => (
                  <div key={badge.label} style={{
                    padding: "2px 10px", borderRadius: "9999px", fontSize: "10px", fontWeight: 700,
                    color: badge.c, background: badge.bg, border: `1px solid ${badge.b}`,
                  }}>
                    {badge.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 14px",
            borderRadius: "12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            marginBottom: "14px",
          }}>
            <AlertCircle size={13} style={{ color: "#f87171", marginTop: "1px", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#fca5a5" }}>{error}</span>
          </div>
        )}

        {/* Tips */}
        <div style={{ padding: "12px 14px", borderRadius: "14px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.14)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <Info size={11} style={{ color: "#818cf8" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#a5b4fc" }}>Supported Formats</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { icon: "📄", label: "PDF", desc: "Bank e-statements from DBS, OCBC, UOB, Citi" },
              { icon: "📊", label: "CSV", desc: "Exported transaction files (Date, Description, Amount)" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "12px", flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: "11px", color: t.textDim }}>
                  <strong style={{ color: t.textMuted }}>{item.label}:</strong> {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
