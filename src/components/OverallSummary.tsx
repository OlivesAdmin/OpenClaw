"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

interface OverallSummaryProps {
  totalCreditCard: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-2xl px-4 py-3 text-xs"
        style={{
          background: "rgba(8,12,26,0.97)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <p className="text-slate-400 font-semibold mb-1">{payload[0].name}</p>
        <p className="text-white font-black tabular-nums text-sm" style={{ color: payload[0].payload.color }}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function OverallSummary({ totalCreditCard }: OverallSummaryProps) {
  const totalFixed    = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalFixed + totalCreditCard;
  const netSavings    = MONTHLY_SALARY - totalExpenses;
  const savingsPct    = (netSavings    / MONTHLY_SALARY) * 100;
  const expensePct    = (totalExpenses / MONTHLY_SALARY) * 100;

  const breakdown = [
    { name: "Rental",  value: 6300,                            color: "#6366f1" },
    { name: "Utility", value: 600,                             color: "#f59e0b" },
    { name: "Helper",  value: 800,                             color: "#10b981" },
    { name: "CC",      value: totalCreditCard,                 color: "#ec4899" },
    { name: "Savings", value: Math.max(netSavings, 0),        color: "#22d3ee" },
  ];

  const rows = [
    { label: "Gross Salary",  value: MONTHLY_SALARY,  positive: true,  color: "#10b981" },
    { label: "Rental",        value: 6300,             positive: false, color: "#6366f1" },
    { label: "Utility Bills", value: 600,              positive: false, color: "#f59e0b" },
    { label: "Helper",        value: 800,              positive: false, color: "#10b981" },
    { label: "Credit Card",   value: totalCreditCard,  positive: false, color: "#ec4899" },
  ];

  return (
    <div className="glass rounded-3xl overflow-hidden fade-in-up" style={{ animationDelay: "0.3s" }}>
      {/* Header */}
      <div className="px-7 pt-7 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="section-label mb-1.5">Overview</p>
            <h2 className="text-base font-bold text-white">Financial Summary</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Monthly income vs expenses</p>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: netSavings >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              color: netSavings >= 0 ? "#34d399" : "#f87171",
              border: `1px solid ${netSavings >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}
          >
            {netSavings >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {savingsPct >= 0 ? `${savingsPct.toFixed(1)}% saved` : "Over income"}
          </div>
        </div>
      </div>

      <div className="h-px mx-7" style={{ background: "rgba(255,255,255,0.05)" }} />

      <div className="px-7 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: chart + rows */}
          <div>
            <div style={{ height: 160 }} className="mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown} barSize={28} margin={{ top: 4, right: 0, bottom: 0, left: -12 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#475569", fontSize: 9, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)", radius: 8 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {breakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Income statement */}
            <div className="space-y-0">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5"
                  style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: row.color, boxShadow: `0 0 6px ${row.color}80` }}
                    />
                    <span className="text-xs text-slate-400 font-medium">{row.label}</span>
                  </div>
                  <span
                    className="text-xs font-black tabular-nums"
                    style={{ color: row.positive ? "#34d399" : "#94a3b8" }}
                  >
                    {row.positive ? "+" : "−"}{formatCurrency(row.value)}
                  </span>
                </div>
              ))}

              {/* Net line */}
              <div
                className="flex items-center justify-between pt-3 mt-1"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span className="text-xs font-bold text-white">Net Savings</span>
                <span
                  className="text-sm font-black tabular-nums"
                  style={{
                    color: netSavings >= 0 ? "#34d399" : "#f87171",
                    letterSpacing: "-0.03em",
                    textShadow: `0 0 12px ${netSavings >= 0 ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.4)"}`,
                  }}
                >
                  {netSavings >= 0 ? "+" : "−"}{formatCurrency(Math.abs(netSavings))}
                </span>
              </div>
            </div>
          </div>

          {/* Right: savings card + progress */}
          <div className="flex flex-col justify-between">
            <div
              className="rounded-3xl p-6"
              style={{
                background: netSavings >= 0
                  ? "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.05) 100%)"
                  : "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(249,115,22,0.05) 100%)",
                border: `1px solid ${netSavings >= 0 ? "rgba(52,211,153,0.18)" : "rgba(239,68,68,0.18)"}`,
                boxShadow: netSavings >= 0 ? "0 8px 32px rgba(16,185,129,0.08)" : "0 8px 32px rgba(239,68,68,0.08)",
              }}
            >
              <div className="section-label mb-1.5">
                Net Monthly {netSavings >= 0 ? "Savings" : "Deficit"}
              </div>
              <div
                className="text-4xl font-black tabular-nums mt-2"
                style={{
                  color: netSavings >= 0 ? "#34d399" : "#f87171",
                  letterSpacing: "-0.05em",
                  textShadow: netSavings >= 0 ? "0 0 40px rgba(52,211,153,0.35)" : "0 0 40px rgba(248,113,113,0.35)",
                }}
              >
                {netSavings >= 0 ? "+" : "−"}{formatCurrency(Math.abs(netSavings))}
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5">After all fixed + CC expenses</div>

              <div className="mt-5">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div
                    className="h-full rounded-full progress-bar-fill"
                    style={{
                      width: `${Math.min(expensePct, 100)}%`,
                      background: netSavings >= 0
                        ? "linear-gradient(90deg, #10b981, #06b6d4)"
                        : "linear-gradient(90deg, #ef4444, #f97316)",
                      boxShadow: netSavings >= 0 ? "0 0 12px rgba(16,185,129,0.5)" : "0 0 12px rgba(239,68,68,0.5)",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-medium">
                  <span>0%</span>
                  <span className="tabular-nums">{expensePct.toFixed(1)}% expenses</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Hints */}
            <div className="mt-4 space-y-2">
              {totalCreditCard === 0 && (
                <div
                  className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <Lightbulb size={13} className="text-slate-600 flex-shrink-0" />
                  <span className="text-xs text-slate-500">Upload a bank statement to see your full summary</span>
                </div>
              )}
              {totalCreditCard > 0 && totalCreditCard > CREDIT_CARD_BUDGET && (
                <div
                  className="flex items-start gap-2.5 px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}
                >
                  <Lightbulb size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-400">
                    Cut CC spend by{" "}
                    <span className="text-red-400 font-black tabular-nums">
                      {formatCurrency(totalCreditCard - CREDIT_CARD_BUDGET)}
                    </span>{" "}
                    to hit your {formatCurrency(CREDIT_CARD_BUDGET)} target
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
