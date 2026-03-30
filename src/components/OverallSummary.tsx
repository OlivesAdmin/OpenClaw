"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { useTheme, useBreakpoint } from "@/lib/theme";

interface OverallSummaryProps {
  totalCreditCard: number;
  monthMultiplier?: number;
}

export default function OverallSummary({ totalCreditCard, monthMultiplier = 1 }: OverallSummaryProps) {
  const { theme, t } = useTheme();
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const salary        = MONTHLY_SALARY * monthMultiplier;
  const totalFixed    = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0) * monthMultiplier;
  const totalExpenses = totalFixed + totalCreditCard;
  const netSavings    = salary - totalExpenses;
  const savingsPct    = (netSavings / salary) * 100;
  const expensePct    = (totalExpenses / salary) * 100;

  const breakdown = [
    { name: "Rental",  value: 6300  * monthMultiplier, color: "#6366f1" },
    { name: "Utility", value: 600   * monthMultiplier, color: "#f59e0b" },
    { name: "Helper",  value: 800   * monthMultiplier, color: "#10b981" },
    { name: "CC",      value: totalCreditCard,          color: "#ec4899" },
    { name: "Savings", value: Math.max(netSavings, 0), color: "#22d3ee" },
  ];

  const moLabel = monthMultiplier > 1 ? ` ×${monthMultiplier}mo` : "";
  const rows = [
    { label: `Gross Salary${moLabel}`, value: salary,               positive: true,  color: "#10b981" },
    { label: `Rental${moLabel}`,       value: 6300 * monthMultiplier, positive: false, color: "#6366f1" },
    { label: `Utility Bills${moLabel}`,value: 600  * monthMultiplier, positive: false, color: "#f59e0b" },
    { label: `Helper${moLabel}`,       value: 800  * monthMultiplier, positive: false, color: "#10b981" },
    { label: "Credit Card",            value: totalCreditCard,        positive: false, color: "#ec4899" },
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: t.tooltipBg, border: `1px solid ${t.cardBorder}`, borderRadius: "12px", padding: "8px 14px", boxShadow: t.cardShadow }}>
        <p style={{ fontSize: "11px", color: t.textMuted, marginBottom: "4px" }}>{payload[0].name}</p>
        <p style={{ fontSize: "14px", fontWeight: 900, color: payload[0].payload.color, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(payload[0].value)}</p>
      </div>
    );
  };

  return (
    <div className="fade-in-up" style={{
      animationDelay: "0.3s", borderRadius: "24px", overflow: "hidden",
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow,
      backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", transition: "background 0.4s",
    }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, #22d3ee, #6366f1, #ec4899)", boxShadow: theme === "dark" ? "0 0 20px rgba(99,102,241,0.6)" : "none" }} />

      <div style={{ padding: "24px 28px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.label, marginBottom: "5px" }}>Overview</div>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: t.text }}>Financial Summary</h2>
            <p style={{ fontSize: "11px", color: t.textDim, marginTop: "3px" }}>{monthMultiplier > 1 ? `${monthMultiplier}-Month` : "Monthly"} income vs expenses</p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "9999px",
            background: netSavings >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${netSavings >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}>
            {netSavings >= 0 ? <TrendingUp size={11} style={{ color: "#34d399" }} /> : <TrendingDown size={11} style={{ color: "#f87171" }} />}
            <span style={{ fontSize: "12px", fontWeight: 700, color: netSavings >= 0 ? "#34d399" : "#f87171" }}>
              {savingsPct >= 0 ? `${savingsPct.toFixed(1)}% saved` : "Over income"}
            </span>
          </div>
        </div>

        <div style={{ height: "1px", background: t.divider, marginBottom: "24px" }} />

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "20px" : "32px" }}>
          {/* Left: chart + income statement */}
          <div>
            <div style={{ height: 160, marginBottom: "24px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown} barSize={28} margin={{ top: 4, right: 0, bottom: 0, left: -12 }}>
                  <XAxis dataKey="name" tick={{ fill: t.textDim, fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: t.hoverBg, radius: 8 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {breakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {rows.map((row, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0",
                borderBottom: i < rows.length - 1 ? `1px solid ${t.divider}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: t.textMuted, fontWeight: 500 }}>{row.label}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 800, color: row.positive ? "#34d399" : t.textMuted, fontVariantNumeric: "tabular-nums" }}>
                  {row.positive ? "+" : "-"}{formatCurrency(row.value)}
                </span>
              </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", marginTop: "4px", borderTop: `1px solid ${t.cardBorder}` }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: t.text }}>Net Savings</span>
              <span style={{
                fontSize: "15px", fontWeight: 900, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em",
                color: netSavings >= 0 ? "#34d399" : "#f87171",
                textShadow: theme === "dark" ? `0 0 12px ${netSavings >= 0 ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.4)"}` : "none",
              }}>
                {netSavings >= 0 ? "+" : "-"}{formatCurrency(Math.abs(netSavings))}
              </span>
            </div>
          </div>

          {/* Right: savings card */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{
              borderRadius: "20px", padding: "24px",
              background: netSavings >= 0
                ? (theme === "dark" ? "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05))" : "rgba(16,185,129,0.05)")
                : (theme === "dark" ? "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(249,115,22,0.05))" : "rgba(239,68,68,0.05)"),
              border: `1px solid ${netSavings >= 0 ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.label }}>
                {monthMultiplier > 1 ? `Net ${monthMultiplier}-Month` : "Net Monthly"} {netSavings >= 0 ? "Savings" : "Deficit"}
              </div>
              <div style={{
                fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 900, fontVariantNumeric: "tabular-nums", marginTop: "8px",
                letterSpacing: "-0.05em", lineHeight: 1,
                color: netSavings >= 0 ? "#34d399" : "#f87171",
                textShadow: theme === "dark" ? `0 0 40px ${netSavings >= 0 ? "rgba(52,211,153,0.35)" : "rgba(248,113,113,0.35)"}` : "none",
              }}>
                {netSavings >= 0 ? "+" : "-"}{formatCurrency(Math.abs(netSavings))}
              </div>
              <div style={{ fontSize: "11px", color: t.textDim, marginTop: "6px" }}>After all fixed + CC expenses</div>

              <div style={{ marginTop: "20px" }}>
                <div style={{ height: "8px", borderRadius: "9999px", background: t.progressTrack, overflow: "hidden" }}>
                  <div className="progress-bar-fill" style={{
                    height: "100%", borderRadius: "9999px",
                    width: `${Math.min(expensePct, 100)}%`,
                    background: netSavings >= 0 ? "linear-gradient(90deg, #10b981, #06b6d4)" : "linear-gradient(90deg, #ef4444, #f97316)",
                    boxShadow: theme === "dark" ? (netSavings >= 0 ? "0 0 12px rgba(16,185,129,0.5)" : "0 0 12px rgba(239,68,68,0.5)") : "none",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                  <span style={{ fontSize: "10px", color: t.textDim }}>0%</span>
                  <span style={{ fontSize: "10px", color: t.textMuted, fontVariantNumeric: "tabular-nums" }}>{expensePct.toFixed(1)}% expenses</span>
                  <span style={{ fontSize: "10px", color: t.textDim }}>100%</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              {totalCreditCard === 0 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "14px",
                  background: t.subCardBg, border: `1px solid ${t.subCardBorder}`,
                }}>
                  <Lightbulb size={13} style={{ color: t.textDim, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: t.textMuted }}>Upload a bank statement to see your full summary</span>
                </div>
              )}
              {totalCreditCard > 0 && totalCreditCard > CREDIT_CARD_BUDGET * monthMultiplier && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 16px", borderRadius: "14px",
                  background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)",
                }}>
                  <Lightbulb size={13} style={{ color: "#f87171", flexShrink: 0, marginTop: "1px" }} />
                  <span style={{ fontSize: "12px", color: t.textMuted }}>
                    Cut CC spend by <span style={{ color: "#f87171", fontWeight: 900 }}>{formatCurrency(totalCreditCard - CREDIT_CARD_BUDGET * monthMultiplier)}</span> to hit your {formatCurrency(CREDIT_CARD_BUDGET * monthMultiplier)} target
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
