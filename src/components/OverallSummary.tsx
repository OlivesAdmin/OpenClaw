"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

interface OverallSummaryProps {
  totalCreditCard: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-3 py-2 text-xs"
        style={{
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
        }}
      >
        <p className="text-slate-300 font-medium mb-0.5">{payload[0].name}</p>
        <p className="text-white font-bold tabular-nums">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function OverallSummary({ totalCreditCard }: OverallSummaryProps) {
  const totalFixed = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalFixed + totalCreditCard;
  const netSavings = MONTHLY_SALARY - totalExpenses;
  const savingsPct = (netSavings / MONTHLY_SALARY) * 100;
  const expensePct = (totalExpenses / MONTHLY_SALARY) * 100;

  const breakdown = [
    { name: "Rental",      value: 6300,              color: "#6366f1" },
    { name: "Utility",     value: 600,               color: "#f59e0b" },
    { name: "Helper",      value: 800,               color: "#10b981" },
    { name: "CC",          value: totalCreditCard,   color: "#ec4899" },
    { name: "Savings",     value: Math.max(netSavings, 0), color: "#22d3ee" },
  ];

  const rows = [
    { label: "Gross Salary",   value: MONTHLY_SALARY,   color: "#10b981", positive: true },
    { label: "Rental",         value: 6300,             color: "#6366f1", positive: false },
    { label: "Utility Bills",  value: 600,              color: "#f59e0b", positive: false },
    { label: "Helper",         value: 800,              color: "#10b981", positive: false },
    { label: "Credit Card",    value: totalCreditCard,  color: "#ec4899", positive: false },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden fade-in-up" style={{ animationDelay: "0.3s" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Financial Summary</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Monthly income vs expenses</p>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: netSavings >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
              color: netSavings >= 0 ? "#34d399" : "#f87171",
              border: `1px solid ${netSavings >= 0 ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
            }}
          >
            {netSavings >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {savingsPct >= 0 ? `${savingsPct.toFixed(1)}% saved` : "Over income"}
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: chart + rows */}
          <div>
            {/* Bar chart */}
            <div style={{ height: 140 }} className="mb-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown} barSize={24} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#475569", fontSize: 9 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                    {breakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Income statement rows */}
            <div className="space-y-0">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: row.color }} />
                    <span className="text-xs text-slate-400">{row.label}</span>
                  </div>
                  <span
                    className="text-xs font-semibold tabular-nums"
                    style={{ color: row.positive ? "#10b981" : "#f87171" }}
                  >
                    {row.positive ? "+" : "−"}{formatCurrency(row.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: net savings + progress */}
          <div className="flex flex-col justify-between">
            {/* Net savings box */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: netSavings >= 0
                  ? "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.06))"
                  : "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(249,115,22,0.06))",
                border: `1px solid ${netSavings >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              <div className="section-label mb-1">
                Net Monthly {netSavings >= 0 ? "Savings" : "Deficit"}
              </div>
              <div
                className="text-3xl font-bold tabular-nums mt-2"
                style={{ color: netSavings >= 0 ? "#34d399" : "#f87171", letterSpacing: "-0.03em" }}
              >
                {netSavings >= 0 ? "+" : "−"}{formatCurrency(Math.abs(netSavings))}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">After all fixed + CC expenses</div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
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
                <div className="flex justify-between mt-1.5 text-[10px] text-slate-600">
                  <span>0%</span>
                  <span className="tabular-nums">Expenses: {expensePct.toFixed(1)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Hints */}
            <div className="mt-4 space-y-2">
              {totalCreditCard === 0 && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-slate-500"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Lightbulb size={12} className="text-slate-600 flex-shrink-0" />
                  Upload a statement to see your complete financial summary
                </div>
              )}
              {totalCreditCard > 0 && totalCreditCard > CREDIT_CARD_BUDGET && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <Lightbulb size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-400">
                    Reduce CC spending by <span className="text-red-400 font-semibold tabular-nums">{formatCurrency(totalCreditCard - CREDIT_CARD_BUDGET)}</span> to hit your {formatCurrency(CREDIT_CARD_BUDGET)} target
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
