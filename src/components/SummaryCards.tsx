"use client";

import { Wallet, ReceiptText, CreditCard, PiggyBank, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";
import { useTheme } from "@/lib/theme";

interface SummaryCardsProps {
  totalCreditCard: number;
  selectedMonth: string;
  effectiveSalary: number;
  effectiveFixed: number;
  monthMultiplier: number;
}

export default function SummaryCards({ totalCreditCard, effectiveSalary, effectiveFixed, monthMultiplier }: SummaryCardsProps) {
  const { theme, t } = useTheme();
  const ccBudget      = CREDIT_CARD_BUDGET * monthMultiplier;
  const totalExpenses = effectiveFixed + totalCreditCard;
  const netSavings    = effectiveSalary - totalExpenses;
  const ccPct         = Math.min((totalCreditCard / ccBudget) * 100, 100);
  const overBudget    = totalCreditCard > ccBudget;
  const expensePct    = (totalExpenses / effectiveSalary) * 100;
  const savingsRate   = (netSavings / effectiveSalary) * 100;

  const cards = [
    {
      label: monthMultiplier > 1 ? `${monthMultiplier}-Month Income` : "Monthly Salary",
      sub: monthMultiplier > 1 ? `${formatCurrency(MONTHLY_SALARY)}/mo × ${monthMultiplier}` : "Fixed income · SGD",
      value: formatCurrency(effectiveSalary),
      Icon: Wallet, TrendIcon: TrendingUp, trendText: "Stable", trendGood: true,
      c1: "#10b981", c2: "#34d399", progress: 100,
    },
    {
      label: "Total Expenses", sub: `${expensePct.toFixed(1)}% of income`,
      value: formatCurrency(totalExpenses),
      Icon: ReceiptText, TrendIcon: expensePct > 80 ? TrendingUp : TrendingDown,
      trendText: expensePct > 80 ? "High" : "Controlled", trendGood: expensePct <= 80,
      c1: expensePct > 90 ? "#ef4444" : "#f97316", c2: expensePct > 90 ? "#f87171" : "#fbbf24",
      progress: Math.min(expensePct, 100),
    },
    {
      label: "CC Budget Used", sub: overBudget ? `Over by ${formatCurrency(totalCreditCard - ccBudget)}` : `${formatCurrency(ccBudget - totalCreditCard)} left`,
      value: `${ccPct.toFixed(1)}%`,
      Icon: overBudget ? AlertTriangle : CreditCard, TrendIcon: overBudget ? TrendingUp : TrendingDown,
      trendText: overBudget ? "Over" : "On Track", trendGood: !overBudget,
      c1: overBudget ? "#ef4444" : "#6366f1", c2: overBudget ? "#f97316" : "#8b5cf6",
      progress: ccPct,
    },
    {
      label: "Net Savings", sub: netSavings >= 0 ? "Great month!" : "Over income",
      value: formatCurrency(Math.abs(netSavings)),
      Icon: PiggyBank, TrendIcon: netSavings >= 0 ? TrendingUp : TrendingDown,
      trendText: `${Math.max(0, savingsRate).toFixed(1)}% rate`, trendGood: netSavings >= 0,
      c1: netSavings >= 0 ? "#f59e0b" : "#ef4444", c2: netSavings >= 0 ? "#fbbf24" : "#f97316",
      progress: Math.max(0, Math.min(savingsRate, 100)),
    },
  ];

  return (
    <>
      {cards.map((card, i) => (
        <div
          key={i}
          className="fade-in-up"
          style={{
            animationDelay: `${i * 0.07}s`,
            borderRadius: "22px",
            overflow: "hidden",
            background: t.summaryCardBg,
            border: `1px solid ${theme === "dark" ? card.c1 + "28" : t.cardBorder}`,
            boxShadow: t.cardShadow,
            transition: "transform 0.25s, box-shadow 0.25s, background 0.4s",
            cursor: "default",
          }}
        >
          {/* Top accent */}
          <div style={{
            height: "4px",
            background: `linear-gradient(90deg, ${card.c1}, ${card.c2})`,
            boxShadow: theme === "dark" ? `0 0 18px ${card.c1}cc, 0 0 36px ${card.c1}50` : "none",
          }} />

          <div style={{ padding: "clamp(12px, 3vw, 18px) clamp(12px, 3vw, 20px) clamp(14px, 3vw, 20px)" }}>
            {/* Icon + trend */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "13px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${card.c1}18`,
                border: `1px solid ${card.c1}2a`,
              }}>
                <card.Icon size={19} style={{ color: card.c1 }} />
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: "4px",
                padding: "3px 9px", borderRadius: "9999px",
                background: card.trendGood ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${card.trendGood ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.22)"}`,
              }}>
                <card.TrendIcon size={9} style={{ color: card.trendGood ? "#10b981" : "#ef4444" }} />
                <span style={{ fontSize: "10px", fontWeight: 700, color: card.trendGood ? "#10b981" : "#ef4444" }}>
                  {card.trendText}
                </span>
              </div>
            </div>

            {/* Value */}
            <div style={{
              fontSize: "clamp(1.1rem, 4.5vw, 2rem)",
              fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1,
              color: card.c1,
              textShadow: theme === "dark" ? `0 0 32px ${card.c1}55` : "none",
              fontVariantNumeric: "tabular-nums",
              wordBreak: "break-all",
            }}>
              {card.value}
            </div>

            <div style={{ fontSize: "clamp(11px, 3vw, 13px)", fontWeight: 600, color: t.textSecondary, marginTop: "8px" }}>{card.label}</div>
            <div style={{ fontSize: "clamp(10px, 2.5vw, 11px)", color: t.textDim, marginTop: "3px" }}>{card.sub}</div>

            {/* Progress */}
            <div style={{ marginTop: "14px" }}>
              <div style={{ height: "4px", borderRadius: "9999px", background: t.progressTrack, overflow: "hidden" }}>
                <div className="progress-bar-fill" style={{
                  height: "100%", borderRadius: "9999px", width: `${card.progress}%`,
                  background: `linear-gradient(90deg, ${card.c1}, ${card.c2})`,
                  boxShadow: theme === "dark" ? `0 0 8px ${card.c1}70` : "none",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "5px" }}>
                <span style={{ fontSize: "10px", color: t.textFaint, fontVariantNumeric: "tabular-nums" }}>{card.progress.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
