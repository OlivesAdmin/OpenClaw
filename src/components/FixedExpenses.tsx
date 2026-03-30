"use client";

import { Home, Zap, Users, ArrowUpRight } from "lucide-react";
import { FIXED_EXPENSES, MONTHLY_SALARY } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

const EXPENSE_META: Record<string, { Icon: React.ElementType; c1: string; c2: string }> = {
  Rental:          { Icon: Home,  c1: "#6366f1", c2: "#8b5cf6" },
  "Utility Bills": { Icon: Zap,   c1: "#f59e0b", c2: "#fbbf24" },
  Helper:          { Icon: Users, c1: "#10b981", c2: "#34d399" },
};

interface FixedExpensesProps {
  monthMultiplier?: number;
}

export default function FixedExpenses({ monthMultiplier = 1 }: FixedExpensesProps) {
  const { theme, t } = useTheme();
  const salary    = MONTHLY_SALARY * monthMultiplier;
  const total     = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0) * monthMultiplier;
  const pct       = ((total / salary) * 100).toFixed(1);
  const remaining = salary - total;

  return (
    <div className="fade-in-up" style={{
      animationDelay: "0.1s", borderRadius: "24px", overflow: "hidden",
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow,
      backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", transition: "background 0.4s",
    }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", boxShadow: theme === "dark" ? "0 0 20px #6366f1cc" : "none" }} />

      <div style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.label, marginBottom: "6px" }}>Recurring</div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: t.text }}>Fixed Expenses</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.04em", color: "#6366f1", textShadow: theme === "dark" ? "0 0 30px rgba(99,102,241,0.5)" : "none" }}>
              {formatCurrency(total)}
            </div>
            <div style={{ fontSize: "11px", color: t.textDim, marginTop: "3px" }}>{pct}% of salary</div>
          </div>
        </div>

        <div style={{ height: "1px", background: t.divider, marginBottom: "20px" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {FIXED_EXPENSES.map((expense) => {
            const barPct = (expense.amount / total) * 100;
            const meta = EXPENSE_META[expense.name] || EXPENSE_META["Rental"];
            return (
              <div key={expense.id}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "12px", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: `${meta.c1}18`, border: `1px solid ${meta.c1}28`,
                    }}>
                      <meta.Icon size={15} style={{ color: meta.c1 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: t.textSecondary }}>{expense.name}</div>
                      <div style={{ fontSize: "10px", color: t.textDim, marginTop: "2px" }}>{barPct.toFixed(0)}% of fixed{monthMultiplier > 1 ? ` · ×${monthMultiplier}mo` : ""}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 900, color: meta.c1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(expense.amount * monthMultiplier)}
                  </div>
                </div>
                <div style={{ height: "3px", borderRadius: "9999px", background: t.progressTrack, overflow: "hidden" }}>
                  <div className="progress-bar-fill" style={{
                    height: "100%", borderRadius: "9999px", width: `${barPct}%`,
                    background: `linear-gradient(90deg, ${meta.c1}, ${meta.c2})`,
                    boxShadow: theme === "dark" ? `0 0 8px ${meta.c1}60` : "none",
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: "20px", padding: "14px 16px", borderRadius: "16px",
          background: theme === "dark" ? "linear-gradient(135deg, rgba(34,211,153,0.1), rgba(6,182,212,0.05))" : "rgba(34,211,153,0.06)",
          border: "1px solid rgba(34,211,153,0.2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#34d399" }}>Remaining</div>
            <div style={{ fontSize: "11px", color: t.textDim, marginTop: "2px" }}>For CC + savings</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#34d399", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(remaining)}</div>
            <ArrowUpRight size={14} style={{ color: "#34d399" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
