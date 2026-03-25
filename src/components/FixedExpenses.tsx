"use client";

import { Home, Zap, Users } from "lucide-react";
import { FIXED_EXPENSES, MONTHLY_SALARY } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

const EXPENSE_META: Record<string, { Icon: React.ElementType; color: string; color2: string }> = {
  Rental:         { Icon: Home,  color: "#6366f1", color2: "#8b5cf6" },
  "Utility Bills":{ Icon: Zap,   color: "#f59e0b", color2: "#fbbf24" },
  Helper:         { Icon: Users, color: "#10b981", color2: "#34d399" },
};

export default function FixedExpenses() {
  const total     = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const pct       = ((total / MONTHLY_SALARY) * 100).toFixed(1);
  const remaining = MONTHLY_SALARY - total;

  return (
    <div className="glass glass-hover rounded-3xl overflow-hidden fade-in-up" style={{ animationDelay: "0.1s" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="section-label mb-1.5">Recurring</p>
            <h2 className="text-base font-bold text-white">Fixed Expenses</h2>
          </div>
          <div className="text-right">
            <div
              className="text-2xl font-black stat-value"
              style={{ color: "#6366f1", letterSpacing: "-0.04em", textShadow: "0 0 24px rgba(99,102,241,0.4)" }}
            >
              {formatCurrency(total)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{pct}% of salary</div>
          </div>
        </div>
      </div>

      <div className="h-px mx-6" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* Expense items */}
      <div className="px-6 py-5 space-y-5">
        {FIXED_EXPENSES.map((expense) => {
          const barPct = (expense.amount / total) * 100;
          const meta = EXPENSE_META[expense.name] || EXPENSE_META["Rental"];
          return (
            <div key={expense.id}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${meta.color}18, ${meta.color2}10)`,
                      border: `1px solid ${meta.color}25`,
                      boxShadow: `0 4px 12px ${meta.color}15`,
                    }}
                  >
                    <meta.Icon size={14} style={{ color: meta.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{expense.name}</div>
                    <div className="text-[10px] text-slate-600">{barPct.toFixed(0)}% of fixed</div>
                  </div>
                </div>
                <div
                  className="text-sm font-black tabular-nums"
                  style={{ color: meta.color, letterSpacing: "-0.02em" }}
                >
                  {formatCurrency(expense.amount)}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div
                  className="h-full rounded-full progress-bar-fill"
                  style={{
                    width: `${barPct}%`,
                    background: `linear-gradient(90deg, ${meta.color}, ${meta.color2})`,
                    boxShadow: `0 0 6px ${meta.color}50`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="mx-5 mb-5 px-4 py-3 rounded-2xl flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, rgba(34,211,153,0.07), rgba(6,182,212,0.04))",
          border: "1px solid rgba(34,211,153,0.15)",
        }}
      >
        <div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Remaining</div>
          <div className="text-[11px] text-slate-400 mt-0.5">For CC + savings</div>
        </div>
        <div
          className="text-lg font-black tabular-nums"
          style={{ color: "#34d399", letterSpacing: "-0.03em", textShadow: "0 0 16px rgba(52,211,153,0.4)" }}
        >
          {formatCurrency(remaining)}
        </div>
      </div>
    </div>
  );
}
