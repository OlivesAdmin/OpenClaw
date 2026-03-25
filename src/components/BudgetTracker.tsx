"use client";

import { CheckCircle, AlertTriangle } from "lucide-react";
import { CREDIT_CARD_BUDGET, FIXED_EXPENSES, MONTHLY_SALARY } from "@/lib/store";
import { formatCurrency, groupByCategory } from "@/lib/utils";
import { CreditCardExpense, CATEGORY_COLORS } from "@/lib/types";

interface BudgetTrackerProps {
  expenses: CreditCardExpense[];
}

export default function BudgetTracker({ expenses }: BudgetTrackerProps) {
  const totalCC     = expenses.reduce((s, e) => s + e.amount, 0);
  const totalFixed  = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const netSavings  = MONTHLY_SALARY - totalFixed - totalCC;
  const ccPct       = Math.min((totalCC / CREDIT_CARD_BUDGET) * 100, 100);
  const overBudget  = totalCC > CREDIT_CARD_BUDGET;

  const budgetColor = ccPct < 60 ? "#10b981" : ccPct < 85 ? "#f59e0b" : "#ef4444";
  const budgetColor2 = ccPct < 60 ? "#34d399" : ccPct < 85 ? "#fbbf24" : "#f97316";

  const r            = 46;
  const circumference = 2 * Math.PI * r;
  const offset       = circumference * (1 - ccPct / 100);

  const categoryTotals = groupByCategory(expenses);
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="glass rounded-3xl overflow-hidden fade-in-up" style={{ animationDelay: "0.15s" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="section-label mb-1.5">Tracking</p>
            <h2 className="text-base font-bold text-white">CC Budget</h2>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: overBudget ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
              color: overBudget ? "#ef4444" : "#10b981",
              border: `1px solid ${overBudget ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
            }}
          >
            {overBudget ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
            {overBudget ? "Over" : "On Track"}
          </div>
        </div>
      </div>

      <div className="h-px mx-6" style={{ background: "rgba(255,255,255,0.05)" }} />

      <div className="px-6 py-5">
        {/* Ring + stats */}
        <div className="flex items-center gap-5 mb-5">
          {/* SVG Ring */}
          <div className="relative flex-shrink-0">
            <svg width="108" height="108" viewBox="0 0 110 110">
              {/* Track */}
              <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              {/* Progress */}
              <circle
                cx="55" cy="55" r={r}
                fill="none"
                stroke={budgetColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 55 55)"
                style={{
                  transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1), stroke 0.3s",
                  filter: `drop-shadow(0 0 8px ${budgetColor}80)`,
                }}
              />
              {/* Glow ring (decorative) */}
              <circle
                cx="55" cy="55" r={r}
                fill="none"
                stroke={budgetColor}
                strokeWidth="1"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 55 55)"
                opacity="0.3"
                style={{ filter: `blur(2px)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-xl font-black tabular-nums leading-none"
                style={{ color: budgetColor, textShadow: `0 0 16px ${budgetColor}60` }}
              >
                {ccPct.toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-600 font-medium mt-0.5">used</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            {[
              { label: "Spent",  value: formatCurrency(totalCC),               color: "#e2e8f0" },
              { label: "Budget", value: formatCurrency(CREDIT_CARD_BUDGET),    color: "#64748b" },
              { label: overBudget ? "Exceeded" : "Left",
                value: formatCurrency(Math.abs(CREDIT_CARD_BUDGET - totalCC)),
                color: overBudget ? "#f87171" : "#34d399" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">{row.label}</span>
                <span className="text-xs font-black tabular-nums" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}

            {/* Progress bar */}
            <div>
              <div className="h-1 rounded-full overflow-hidden mt-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div
                  className="h-full rounded-full progress-bar-fill"
                  style={{
                    width: `${ccPct}%`,
                    background: `linear-gradient(90deg, ${budgetColor}, ${budgetColor2})`,
                    boxShadow: `0 0 6px ${budgetColor}50`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Net savings */}
        <div
          className="rounded-2xl px-4 py-3 mb-4"
          style={{
            background: netSavings >= 0
              ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.04))"
              : "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(249,115,22,0.04))",
            border: `1px solid ${netSavings >= 0 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"}`,
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Savings</div>
              <div className="text-[10px] text-slate-600 mt-0.5">Salary − all expenses</div>
            </div>
            <div
              className="text-base font-black tabular-nums"
              style={{
                color: netSavings >= 0 ? "#34d399" : "#f87171",
                letterSpacing: "-0.03em",
                textShadow: `0 0 16px ${netSavings >= 0 ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.4)"}`,
              }}
            >
              {netSavings >= 0 ? "+" : "−"}{formatCurrency(Math.abs(netSavings))}
            </div>
          </div>
        </div>

        {/* Top categories */}
        {sortedCategories.length > 0 && (
          <div>
            <div className="section-label mb-3">Top Categories</div>
            <div className="space-y-2.5">
              {sortedCategories.map(([cat, amount]) => {
                const catPct  = (amount / totalCC) * 100;
                const catColor = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || "#94a3b8";
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catColor, boxShadow: `0 0 6px ${catColor}80` }} />
                        <span className="text-xs text-slate-400 truncate font-medium">{cat}</span>
                      </div>
                      <span className="text-xs font-black text-white tabular-nums">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${catPct}%`, background: catColor, boxShadow: `0 0 4px ${catColor}60` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
