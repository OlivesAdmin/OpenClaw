"use client";

import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
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
    "DBS Cashback",
    "DBS Altitude",
    "OCBC 365",
    "OCBC Frank",
    "UOB One",
    "Citi PremierMiles",
    "AMEX True Cashback",
    "Standard Chartered",
  ];

  return (
    <div className="glass rounded-2xl p-6 fade-in-up" style={{ animationDelay: "0.05s" }}>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: "rgba(99,102,241,0.2)" }}>
          📤
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Upload Statement</h2>
          <p className="text-xs text-slate-500">Import CSV from your bank</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block font-medium uppercase tracking-wider">Card</label>
          <select
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {cardOptions.map((opt) => (
              <option key={opt} value={opt} style={{ background: "#0f172a" }}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block font-medium uppercase tracking-wider">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              colorScheme: "dark",
            }}
          />
        </div>
      </div>

      <div
        className={`upload-zone rounded-xl p-6 text-center cursor-pointer ${isDragging ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleChange} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <span className="text-sm text-slate-400">Processing...</span>
          </div>
        ) : (
          <>
            <div className="text-2xl mb-2">📁</div>
            <div className="text-sm text-slate-300 font-medium">
              {isDragging ? "Drop to upload" : "Drop CSV or click to browse"}
            </div>
            <div className="text-xs text-slate-600 mt-1">Supports DBS, OCBC, UOB, Citi formats</div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 px-3 py-2 rounded-xl text-xs text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          ⚠️ {error}
        </div>
      )}

      <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
        <div className="text-xs font-medium text-indigo-300 mb-1.5">CSV Format Tips</div>
        <div className="space-y-0.5 text-xs text-slate-500">
          <div>• Columns: Date, Description, Amount/Debit</div>
          <div>• Amounts must be positive numbers</div>
          <div>• Header row required</div>
        </div>
      </div>
    </div>
  );
}
