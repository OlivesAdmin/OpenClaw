"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

interface OverallSummaryProps {
  totalCreditCard: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs">
        <p className="text-slate-300 font-medium">{payload[0].name}</p>
        <p className="text-white font-bold mt-0.5">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function OverallSummary({ totalCreditCard }: OverallSummaryProps) {
  const totalFixed = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalFixed + totalCreditCard;
  const netSavings = MONTHLY_SALARY - totalExpenses;
  const savingsPct = ((netSavings / MONTHLY_SALARY) * 100);
  const expensePct = ((totalExpenses / MONTHLY_SALARY) * 100);

  const breakdown = [
    { name: "Rental", value: 6300, color: "#6366f1" },
    { name: "Utility", value: 600, color: "#f59e0b" },
    { name: "Helper", value: 800, color: "#10b981" },
    { name: "Credit Card", value: totalCreditCard, color: "#ec4899" },
    { name: "Savings", value: Math.max(netSavings, 0), color: "#22d3ee" },
  ];

  const rows = [
    { label: "Gross Salary", value: MONTHLY_SALARY, color: "#10b981", prefix: "+" },
    { label: "Rental", value: -6300, color: "#6366f1", prefix: "-" },
    { label: "Utility Bills", value: -600, color: "#f59e0b", prefix: "-" },
    { label: "Helper", value: -800, color: "#10b981", prefix: "-" },
    { label: "Credit Card", value: -totalCreditCard, color: "#ec4899", prefix: "-" },
  ];

  return (
    <div className="glass rounded-2xl p-6 fade-in-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Overall Financial Summary</h2>
          <p className="text-xs text-slate-500 mt-0.5">Monthly income vs expenses</p>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: netSavings >= 0 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            color: netSavings >= 0 ? "#34d399" : "#f87171",
          }}
        >
          {savingsPct >= 0 ? `${savingsPct.toFixed(1)}% saved` : "Over income"}
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ height: 130 }} className="mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={breakdown} barSize={28} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {breakdown.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Income statement rows */}
      <div className="space-y-2 mb-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: row.color }} />
              <span className="text-sm text-slate-400">{row.label}</span>
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: row.value >= 0 ? "#10b981" : "#f87171" }}
            >
              {row.prefix}{formatCurrency(Math.abs(row.value))}
            </span>
          </div>
        ))}
      </div>

      {/* Net result */}
      <div
        className="rounded-xl p-4"
        style={{
          background: netSavings >= 0
            ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))"
            : "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(249,115,22,0.08))",
          border: `1px solid ${netSavings >= 0 ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Net Monthly {netSavings >= 0 ? "Savings" : "Deficit"}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              After all fixed + CC expenses
            </div>
          </div>
          <div>
            <div
              className="text-2xl font-bold"
              style={{ color: netSavings >= 0 ? "#34d399" : "#f87171" }}
            >
              {netSavings >= 0 ? "+" : "-"}{formatCurrency(Math.abs(netSavings))}
            </div>
            <div className="text-xs text-slate-600 text-right mt-0.5">
              {Math.abs(expensePct).toFixed(1)}% expense ratio
            </div>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full progress-bar-fill"
            style={{
              width: `${Math.min(expensePct, 100)}%`,
              background: netSavings >= 0
                ? "linear-gradient(90deg, #10b981, #06b6d4)"
                : "linear-gradient(90deg, #ef4444, #f97316)",
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>0%</span>
          <span>Expenses: {expensePct.toFixed(1)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* CC Budget hint */}
      {totalCreditCard === 0 && (
        <div className="mt-3 text-center text-xs text-slate-600">
          Upload a statement to see complete summary
        </div>
      )}
      {totalCreditCard > 0 && totalCreditCard > CREDIT_CARD_BUDGET && (
        <div className="mt-3 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <span className="text-red-400 font-medium">💡 Tip:</span>{" "}
          <span className="text-slate-500">
            Reduce CC spending by {formatCurrency(totalCreditCard - CREDIT_CARD_BUDGET)} to hit your 10k target
          </span>
        </div>
      )}
    </div>
  );
}
