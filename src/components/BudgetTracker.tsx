"use client";

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
  const totalExpenses = totalCC + totalFixed;
  const netSavings = MONTHLY_SALARY - totalExpenses;
  const ccPct = Math.min((totalCC / CREDIT_CARD_BUDGET) * 100, 100);
  const overBudget = totalCC > CREDIT_CARD_BUDGET;
  const categoryTotals = groupByCategory(expenses);
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const budgetColor = ccPct < 60 ? "#10b981" : ccPct < 85 ? "#f59e0b" : "#ef4444";

  return (
    <div className="glass rounded-2xl p-6 fade-in-up" style={{ animationDelay: "0.15s" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">CC Budget Tracker</h2>
          <p className="text-xs text-slate-500 mt-0.5">Target: {formatCurrency(CREDIT_CARD_BUDGET)} / month</p>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: overBudget ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
            color: overBudget ? "#ef4444" : "#10b981",
          }}
        >
          {overBudget ? "Over Budget" : "On Track"}
        </div>
      </div>

      {/* Main progress ring area */}
      <div className="flex items-center gap-5 mb-5">
        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="45" cy="45" r="38"
              fill="none"
              stroke={budgetColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - ccPct / 100)}`}
              transform="rotate(-90 45 45)"
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.3s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-white">{ccPct.toFixed(0)}%</span>
            <span className="text-xs text-slate-500">used</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Spent</span>
            <span className="font-semibold text-white">{formatCurrency(totalCC)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Budget</span>
            <span className="font-semibold text-slate-300">{formatCurrency(CREDIT_CARD_BUDGET)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{overBudget ? "Exceeded" : "Remaining"}</span>
            <span className={`font-semibold ${overBudget ? "text-red-400" : "text-emerald-400"}`}>
              {formatCurrency(Math.abs(CREDIT_CARD_BUDGET - totalCC))}
            </span>
          </div>
        </div>
      </div>

      {/* Savings summary */}
      <div
        className="rounded-xl p-3 mb-4"
        style={{
          background: netSavings >= 0 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${netSavings >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-slate-400">Net Savings this Month</div>
            <div className="text-xs text-slate-500 mt-0.5">Salary − All Expenses</div>
          </div>
          <div
            className="text-lg font-bold"
            style={{ color: netSavings >= 0 ? "#10b981" : "#ef4444" }}
          >
            {netSavings >= 0 ? "+" : "-"}{formatCurrency(Math.abs(netSavings))}
          </div>
        </div>
      </div>

      {/* Top categories */}
      {sortedCategories.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Top Categories</div>
          <div className="space-y-1.5">
            {sortedCategories.map(([cat, amount]) => (
              <div key={cat} className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || "#94a3b8" }}
                />
                <div className="flex-1 text-xs text-slate-400 truncate">{cat}</div>
                <div className="text-xs font-medium text-white">{formatCurrency(amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
