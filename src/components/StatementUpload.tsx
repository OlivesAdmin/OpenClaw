"use client";

import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud, FileText, AlertCircle, Info } from "lucide-react";
import { Statement } from "@/lib/types";
import { parseCSVToExpenses } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

interface StatementUploadProps {
  onUpload: (statement: Statement) => void;
}

export default function StatementUpload({ onUpload }: StatementUploadProps) {
  const { theme, t } = useTheme();
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
          if (expenses.length === 0) { setError("No valid expense rows found."); setUploading(false); return; }
          onUpload({
            id: `${cardName}-${month}-${Date.now()}`, filename: file.name,
            uploadDate: new Date().toISOString(), cardName, month, expenses,
            total: expenses.reduce((s, e) => s + e.amount, 0),
          });
          setUploading(false);
        } catch { setError("Failed to parse CSV"); setUploading(false); }
      },
      error: () => { setError("Failed to read file"); setUploading(false); },
    });
  }, [cardName, month, onUpload]);

  const cardOptions = ["DBS Cashback", "DBS Altitude", "OCBC 365", "OCBC Frank", "UOB One", "Citi PremierMiles", "AMEX True Cashback", "Standard Chartered"];

  return (
    <div className="fade-in-up" style={{
      animationDelay: "0.05s", borderRadius: "24px", overflow: "hidden",
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow,
      backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", transition: "background 0.4s",
    }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", boxShadow: theme === "dark" ? "0 0 20px #6366f1cc" : "none" }} />

      <div style={{ padding: "22px 24px" }}>
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
            <p style={{ fontSize: "11px", color: t.textDim, marginTop: "2px" }}>Import CSV from your bank</p>
          </div>
        </div>

        <div style={{ height: "1px", background: t.divider, marginBottom: "20px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.label, display: "block", marginBottom: "6px" }}>Card</label>
            <select value={cardName} onChange={(e) => setCardName(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", fontSize: "12px", borderRadius: "10px",
                background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textSecondary,
                outline: "none",
              }}>
              {cardOptions.map((opt) => <option key={opt} value={opt} style={{ background: t.selectBg }}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.label, display: "block", marginBottom: "6px" }}>Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", fontSize: "12px", borderRadius: "10px",
                background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textSecondary,
                outline: "none", colorScheme: theme,
              }} />
          </div>
        </div>

        <div
          style={{
            border: `1.5px dashed ${isDragging ? "rgba(99,102,241,0.6)" : `rgba(99,102,241,${theme === "dark" ? "0.25" : "0.4"})`}`,
            borderRadius: "16px", padding: "28px 20px", textAlign: "center", cursor: "pointer",
            background: isDragging ? "rgba(99,102,241,0.07)" : "transparent", transition: "all 0.25s",
            marginBottom: "14px",
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
          {uploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: "12px", color: t.textMuted }}>Processing...</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
              }}>
                <FileText size={20} style={{ color: "#818cf8" }} />
              </div>
              <div>
                <div style={{ fontSize: "13px", color: t.textSecondary, fontWeight: 600 }}>Drop CSV or click to browse</div>
                <div style={{ fontSize: "11px", color: t.textDim, marginTop: "4px" }}>DBS, OCBC, UOB, Citi formats</div>
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

        <div style={{ padding: "12px 14px", borderRadius: "14px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.14)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Info size={11} style={{ color: "#818cf8" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#a5b4fc" }}>CSV Format</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {["Columns: Date, Description, Amount/Debit", "Amounts must be positive numbers", "Header row required"].map((txt) => (
              <div key={txt} style={{ fontSize: "11px", color: t.textDim }}>{txt}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
