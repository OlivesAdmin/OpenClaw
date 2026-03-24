"use client";

import { Home, Zap, Users, ArrowRight } from "lucide-react";
import { FIXED_EXPENSES, MONTHLY_SALARY } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

const EXPENSE_ICONS: Record<string, React.ElementType> = {
  Rental: Home,
  "Utility Bills": Zap,
  Helper: Users,
};

export default function FixedExpenses() {
  const total = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const pct = ((total / MONTHLY_SALARY) * 100).toFixed(1);
  const remaining = MONTHLY_SALARY - total;

  return (
    <div className="glass rounded-2xl overflow-hidden fade-in-up" style={{ animationDelay: "0.1s" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.05]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Fixed Expenses</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Monthly recurring costs</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold stat-value gradient-text">{formatCurrency(total)}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{pct}% of salary</div>
          </div>
        </div>
      </div>

      {/* Expense items */}
      <div className="px-6 py-4 space-y-4">
        {FIXED_EXPENSES.map((expense) => {
          const barPct = (expense.amount / total) * 100;
          const Icon = EXPENSE_ICONS[expense.name] || Home;
          return (
            <div key={expense.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="icon-box w-8 h-8"
                    style={{ background: `${expense.color}18` }}
                  >
                    <Icon size={14} style={{ color: expense.color }} />
                  </div>
                  <span className="text-sm text-slate-200 font-medium">{expense.name}</span>
                </div>
                <span className="text-sm font-semibold text-white tabular-nums">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div
                  className="h-full rounded-full progress-bar-fill"
                  style={{ width: `${barPct}%`, background: `linear-gradient(90deg, ${expense.color}, ${expense.color}99)` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mx-6 mb-5 px-4 py-3 rounded-xl flex items-center justify-between"
        style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.15)" }}>
        <div className="flex items-center gap-1.5">
          <ArrowRight size={13} className="text-emerald-500" />
          <span className="text-xs text-slate-400">Remaining for CC + savings</span>
        </div>
        <span className="text-sm font-bold text-emerald-400 tabular-nums">{formatCurrency(remaining)}</span>
      </div>
    </div>
  );
}
