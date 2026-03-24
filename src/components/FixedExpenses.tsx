"use client";

import { FIXED_EXPENSES, MONTHLY_SALARY } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function FixedExpenses() {
  const total = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const pct = ((total / MONTHLY_SALARY) * 100).toFixed(1);

  return (
    <div className="glass rounded-2xl p-6 fade-in-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Fixed Expenses</h2>
          <p className="text-xs text-slate-500 mt-0.5">Monthly recurring costs</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold gradient-text">{formatCurrency(total)}</div>
          <div className="text-xs text-slate-500">{pct}% of salary</div>
        </div>
      </div>

      <div className="space-y-3">
        {FIXED_EXPENSES.map((expense) => {
          const barPct = (expense.amount / total) * 100;
          return (
            <div key={expense.id} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                    style={{ background: `${expense.color}20` }}
                  >
                    {expense.icon}
                  </div>
                  <span className="text-sm text-slate-200 font-medium">{expense.name}</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full progress-bar-fill"
                  style={{
                    width: `${barPct}%`,
                    background: expense.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-slate-500">Remaining after fixed</span>
        <span className="text-sm font-semibold text-emerald-400">
          {formatCurrency(MONTHLY_SALARY - total)}
        </span>
      </div>
    </div>
  );
}
