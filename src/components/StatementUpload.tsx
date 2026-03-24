"use client";

import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud, FileText, AlertCircle, Info } from "lucide-react";
import { Statement } from "@/lib/types";
import { parseCSVToExpenses } from "@/lib/utils";

interface StatementUploadProps {
  onUpload: (statement: Statement) => void;
}

export default function StatementUpload({ onUpload }: StatementUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cardName, setCardName] = useState("DBS Cashback");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        setError("Please upload a CSV file");
        return;
      }
      setUploading(true);
      setError("");
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const expenses = parseCSVToExpenses(
              results.data as Record<string, string>[],
              cardName
            );
            if (expenses.length === 0) {
              setError("No valid expense rows found. Check CSV format.");
              setUploading(false);
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
            setUploading(false);
          } catch {
            setError("Failed to parse CSV file");
            setUploading(false);
          }
        },
        error: () => {
          setError("Failed to read file");
          setUploading(false);
        },
      });
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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const cardOptions = [
    "DBS Cashback", "DBS Altitude", "OCBC 365", "OCBC Frank",
    "UOB One", "Citi PremierMiles", "AMEX True Cashback", "Standard Chartered",
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden fade-in-up" style={{ animationDelay: "0.05s" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="icon-box w-8 h-8" style={{ background: "rgba(99,102,241,0.15)" }}>
            <UploadCloud size={15} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Upload Statement</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Import CSV from your bank</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Card + Month selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="section-label block mb-1.5">Card</label>
            <select
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="input-glass w-full px-3 py-2 text-xs text-slate-200"
            >
              {cardOptions.map((opt) => (
                <option key={opt} value={opt} style={{ background: "#0f172a" }}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="section-label block mb-1.5">Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input-glass w-full px-3 py-2 text-xs text-slate-200"
              style={{ colorScheme: "dark" }}
            />
          </div>
        </div>

        {/* Drop zone */}
        <div
          className={`upload-zone rounded-xl py-7 text-center cursor-pointer ${isDragging ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleChange} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span className="text-xs text-slate-400">Processing…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="icon-box w-10 h-10 mx-auto" style={{ background: "rgba(99,102,241,0.12)" }}>
                <FileText size={18} className="text-indigo-400" />
              </div>
              <div>
                <div className="text-sm text-slate-300 font-medium">
                  {isDragging ? "Drop to upload" : "Drop CSV or click to browse"}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">DBS · OCBC · UOB · Citi formats</div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-red-300">{error}</span>
          </div>
        )}

        {/* Tips */}
        <div className="px-3 py-3 rounded-xl"
          style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Info size={11} className="text-indigo-400" />
            <span className="text-[11px] font-semibold text-indigo-300">CSV Format</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-500">
            <div>Columns: Date, Description, Amount/Debit</div>
            <div>Amounts must be positive numbers</div>
            <div>Header row required</div>
          </div>
        </div>
      </div>
    </div>
  );
}
