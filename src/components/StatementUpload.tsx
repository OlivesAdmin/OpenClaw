"use client";

import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud, FileText, AlertCircle, Info } from "lucide-react";
import { Statement } from "@/lib/types";
import { parseCSVToExpenses } from "@/lib/utils";

interface StatementUploadProps {
  onUpload: (statement: Statement) => void;
}

const CARD_STYLE = {
  borderRadius: "24px",
  overflow: "hidden" as const,
  background: "rgba(14, 20, 42, 0.95)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.06) inset",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
};

export default function StatementUpload({ onUpload }: StatementUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cardName, setCardName] = useState("DBS Cashback");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) { setError("Please upload a CSV file"); return; }
    setUploading(true); setError("");
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        try {
          const expenses = parseCSVToExpenses(results.data as Record<string, string>[], cardName);
          if (expenses.length === 0) { setError("No valid expense rows found. Check CSV format."); setUploading(false); return; }
          onUpload({
            id: `${cardName}-${month}-${Date.now()}`,
            filename: file.name, uploadDate: new Date().toISOString(),
            cardName, month, expenses,
            total: expenses.reduce((s, e) => s + e.amount, 0),
          });
          setUploading(false);
        } catch { setError("Failed to parse CSV file"); setUploading(false); }
      },
      error: () => { setError("Failed to read file"); setUploading(false); },
    });
  }, [cardName, month, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const cardOptions = ["DBS Cashback", "DBS Altitude", "OCBC 365", "OCBC Frank", "UOB One", "Citi PremierMiles", "AMEX True Cashback", "Standard Chartered"];

  return (
    <div className="fade-in-up" style={{ ...CARD_STYLE, animationDelay: "0.05s" }}>
      {/* Top strip */}
      <div style={{ height: "4px", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", boxShadow: "0 0 20px #6366f1cc" }} />

      <div style={{ padding: "22px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.12))",
            border: "1px solid rgba(99,102,241,0.3)",
            boxShadow: "0 4px 16px rgba(99,102,241,0.2)",
          }}>
            <UploadCloud size={17} style={{ color: "#818cf8" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>Upload Statement</h2>
            <p style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Import CSV from your bank</p>
          </div>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "20px" }} />

        {/* Selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", display: "block", marginBottom: "6px" }}>Card</label>
            <select value={cardName} onChange={(e) => setCardName(e.target.value)} className="input-glass w-full px-3 py-2 text-xs text-slate-200">
              {cardOptions.map((opt) => <option key={opt} value={opt} style={{ background: "#0d1220" }}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", display: "block", marginBottom: "6px" }}>Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input-glass w-full px-3 py-2 text-xs text-slate-200" style={{ colorScheme: "dark" }} />
          </div>
        </div>

        {/* Drop zone */}
        <div
          className={isDragging ? "drag-over" : ""}
          style={{
            border: `1.5px dashed ${isDragging ? "rgba(99,102,241,0.6)" : "rgba(99,102,241,0.25)"}`,
            borderRadius: "16px",
            padding: "28px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: isDragging ? "rgba(99,102,241,0.07)" : "rgba(99,102,241,0.02)",
            transition: "all 0.25s",
            marginBottom: "14px",
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
          {uploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Processing…</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "14px", margin: "0 auto",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.1))",
                border: "1px solid rgba(99,102,241,0.25)",
              }}>
                <FileText size={20} style={{ color: "#818cf8" }} />
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#cbd5e1", fontWeight: 600 }}>
                  {isDragging ? "Drop to upload" : "Drop CSV or click to browse"}
                </div>
                <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>DBS · OCBC · UOB · Citi formats</div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 14px", borderRadius: "12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: "14px" }}>
            <AlertCircle size={13} style={{ color: "#f87171", marginTop: "1px", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#fca5a5" }}>{error}</span>
          </div>
        )}

        {/* Tips */}
        <div style={{ padding: "12px 14px", borderRadius: "14px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.14)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Info size={11} style={{ color: "#818cf8" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#a5b4fc" }}>CSV Format</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {["Columns: Date, Description, Amount/Debit", "Amounts must be positive numbers", "Header row required"].map((t) => (
              <div key={t} style={{ fontSize: "11px", color: "#64748b" }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
