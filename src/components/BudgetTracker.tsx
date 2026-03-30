"use client";

import { CheckCircle, AlertTriangle } from "lucide-react";
import { CREDIT_CARD_BUDGET, FIXED_EXPENSES, MONTHLY_SALARY } from "@/lib/store";
import { formatCurrency, groupByCategory } from "@/lib/utils";
import { CreditCardExpense, CATEGORY_COLORS } from "@/lib/types";
import { useTheme, useBreakpoint } from "@/lib/theme";

interface BudgetTrackerProps {
  expenses: CreditCardExpense[];
  monthMultiplier?: number;
}

export default function BudgetTracker({ expenses, monthMultiplier = 1 }: BudgetTrackerProps) {
  const { theme, t } = useTheme();
  const isMobile = useBreakpoint() === "mobile";
  const totalCC    = expenses.reduce((s, e) => s + e.amount, 0);
  const totalFixed = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0) * monthMultiplier;
  const netSavings = MONTHLY_SALARY * monthMultiplier - totalFixed - totalCC;
  const ccBudget   = CREDIT_CARD_BUDGET * monthMultiplier;
  const ccPct      = Math.min((totalCC / ccBudget) * 100, 100);
  const overBudget = totalCC > ccBudget;

  const budgetC1 = ccPct < 60 ? "#10b981" : ccPct < 85 ? "#f59e0b" : "#ef4444";
  const budgetC2 = ccPct < 60 ? "#34d399" : ccPct < 85 ? "#fbbf24" : "#f97316";

  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - ccPct / 100);

  const catTotals = groupByCategory(expenses);
  const sorted = Object.entries(catTotals).sort(([, a], [, b]) => b - a).slice(0, 4);

  return (
    <div className="fade-in-up" style={{
      animationDelay: "0.15s", borderRadius: "24px", overflow: "hidden",
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow,
      backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", transition: "background 0.4s",
    }}>
      <div style={{ height: "4px", background: `linear-gradient(90deg, ${budgetC1}, ${budgetC2})`, boxShadow: theme === "dark" ? `0 0 20px ${budgetC1}cc` : "none" }} />

      <div style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.label, marginBottom: "6px" }}>Tracking</div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: t.text }}>CC Budget</h2>
            <div style={{ fontSize: "11px", color: t.textDim, marginTop: "3px" }}>Target: {formatCurrency(ccBudget)}{monthMultiplier > 1 ? ` (${monthMultiplier}mo)` : "/mo"}</div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "9999px",
            background: overBudget ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
            border: `1px solid ${overBudget ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}`,
          }}>
            {overBudget ? <AlertTriangle size={11} style={{ color: "#ef4444" }} /> : <CheckCircle size={11} style={{ color: "#10b981" }} />}
            <span style={{ fontSize: "11px", fontWeight: 700, color: overBudget ? "#ef4444" : "#10b981" }}>{overBudget ? "Over" : "On Track"}</span>
          </div>
        </div>

        <div style={{ height: "1px", background: t.divider, marginBottom: "20px" }} />

        {/* Ring + stats */}
        <div style={{ display: "flex", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "12px" : "20px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg width="114" height="114" viewBox="0 0 114 114">
              <circle cx="57" cy="57" r={r} fill="none" stroke={t.progressTrack} strokeWidth="9" />
              <circle cx="57" cy="57" r={r} fill="none" stroke={budgetC1} strokeWidth="9" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 57 57)"
                style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1), stroke 0.3s",
                  filter: theme === "dark" ? `drop-shadow(0 0 10px ${budgetC1}aa)` : "none" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "22px", fontWeight: 900, color: budgetC1, letterSpacing: "-0.04em" }}>{ccPct.toFixed(0)}%</span>
              <span style={{ fontSize: "10px", color: t.textDim, fontWeight: 600, marginTop: "2px" }}>used</span>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Spent",  val: formatCurrency(totalCC),  c: t.text },
              { label: "Budget", val: formatCurrency(ccBudget), c: t.textDim },
              { label: overBudget ? "Exceeded" : "Left", val: formatCurrency(Math.abs(ccBudget - totalCC)), c: overBudget ? "#f87171" : "#34d399" },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: t.textDim, fontWeight: 500 }}>{r.label}</span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: r.c, fontVariantNumeric: "tabular-nums" }}>{r.val}</span>
              </div>
            ))}
            <div style={{ height: "4px", borderRadius: "9999px", background: t.progressTrack, overflow: "hidden" }}>
              <div className="progress-bar-fill" style={{ height: "100%", borderRadius: "9999px", width: `${ccPct}%`, background: `linear-gradient(90deg, ${budgetC1}, ${budgetC2})` }} />
            </div>
          </div>
        </div>

        {/* Net savings */}
        <div style={{
          padding: "14px 16px", borderRadius: "16px", marginBottom: sorted.length > 0 ? "20px" : 0,
          background: netSavings >= 0
            ? (theme === "dark" ? "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05))" : "rgba(16,185,129,0.06)")
            : (theme === "dark" ? "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(249,115,22,0.05))" : "rgba(239,68,68,0.06)"),
          border: `1px solid ${netSavings >= 0 ? "rgba(52,211,153,0.22)" : "rgba(239,68,68,0.22)"}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: netSavings >= 0 ? "#34d399" : "#f87171" }}>Net Savings</div>
            <div style={{ fontSize: "10px", color: t.textDim, marginTop: "2px" }}>Salary - all expenses</div>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 900, letterSpacing: "-0.04em", color: netSavings >= 0 ? "#34d399" : "#f87171", fontVariantNumeric: "tabular-nums" }}>
            {netSavings >= 0 ? "+" : "-"}{formatCurrency(Math.abs(netSavings))}
          </div>
        </div>

        {sorted.length > 0 && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.label, marginBottom: "12px" }}>Top Categories</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {sorted.map(([cat, amount]) => {
                const catPct = (amount / totalCC) * 100;
                const catColor = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || "#94a3b8";
                return (
                  <div key={cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: catColor, flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: t.textMuted, fontWeight: 500 }}>{cat}</span>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: t.text, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(amount)}</span>
                    </div>
                    <div style={{ height: "2px", borderRadius: "9999px", background: t.progressTrack, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "9999px", width: `${catPct}%`, background: catColor }} />
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
