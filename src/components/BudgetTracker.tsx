"use client";

import { CheckCircle, AlertTriangle } from "lucide-react";
import { CREDIT_CARD_BUDGET, FIXED_EXPENSES, MONTHLY_SALARY } from "@/lib/store";
import { formatCurrency, groupByCategory } from "@/lib/utils";
import { CreditCardExpense } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/types";

interface BudgetTrackerProps {
  expenses: CreditCardExpense[];
}

export default function BudgetTracker({ expenses }: BudgetTrackerProps) {
  const totalCC = expenses.reduce((s, e) => s + e.amount, 0);
  const totalFixed = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const netSavings = MONTHLY_SALARY - totalFixed - totalCC;
  const ccPct = Math.min((totalCC / CREDIT_CARD_BUDGET) * 100, 100);
  const overBudget = totalCC > CREDIT_CARD_BUDGET;
  const categoryTotals = groupByCategory(expenses);
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const budgetColor =
    ccPct < 60 ? "#10b981" : ccPct < 85 ? "#f59e0b" : "#ef4444";
  const r = 38;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="glass rounded-2xl overflow-hidden fade-in-up" style={{ animationDelay: "0.15s" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">CC Budget Tracker</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Target: {formatCurrency(CREDIT_CARD_BUDGET)}/mo</p>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: overBudget ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
              color: overBudget ? "#ef4444" : "#10b981",
              border: `1px solid ${overBudget ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}`,
            }}
          >
            {overBudget
              ? <AlertTriangle size={11} />
              : <CheckCircle size={11} />}
            {overBudget ? "Over Budget" : "On Track"}
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Ring + stats */}
        <div className="flex items-center gap-5 mb-4">
          <div className="relative flex-shrink-0">
            <svg width="88" height="88" viewBox="0 0 90 90">
              {/* Track */}
              <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
              {/* Progress */}
              <circle
                cx="45" cy="45" r={r}
                fill="none"
                stroke={budgetColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - ccPct / 100)}
                transform="rotate(-90 45 45)"
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.3s", filter: `drop-shadow(0 0 6px ${budgetColor}60)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white tabular-nums">{ccPct.toFixed(0)}%</span>
              <span className="text-[10px] text-slate-500">used</span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            {[
              { label: "Spent", value: formatCurrency(totalCC), color: "text-white" },
              { label: "Budget", value: formatCurrency(CREDIT_CARD_BUDGET), color: "text-slate-300" },
              { label: overBudget ? "Exceeded" : "Left", value: formatCurrency(Math.abs(CREDIT_CARD_BUDGET - totalCC)), color: overBudget ? "text-red-400" : "text-emerald-400" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{row.label}</span>
                <span className={`text-xs font-semibold tabular-nums ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Net savings box */}
        <div
          className="rounded-xl p-3 mb-4"
          style={{
            background: netSavings >= 0 ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
            border: `1px solid ${netSavings >= 0 ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.18)"}`,
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Net Savings</div>
              <div className="text-[10px] text-slate-600 mt-0.5">Salary − all expenses</div>
            </div>
            <div
              className="text-base font-bold tabular-nums"
              style={{ color: netSavings >= 0 ? "#10b981" : "#ef4444" }}
            >
              {netSavings >= 0 ? "+" : "-"}{formatCurrency(Math.abs(netSavings))}
            </div>
          </div>
        </div>

        {/* Top categories */}
        {sortedCategories.length > 0 && (
          <div>
            <div className="section-label mb-2.5">Top Categories</div>
            <div className="space-y-2">
              {sortedCategories.map(([cat, amount]) => {
                const catPct = (amount / totalCC) * 100;
                const catColor = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || "#94a3b8";
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: catColor }} />
                        <span className="text-xs text-slate-400 truncate">{cat}</span>
                      </div>
                      <span className="text-xs font-medium text-white tabular-nums">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full" style={{ width: `${catPct}%`, background: catColor, opacity: 0.7 }} />
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
