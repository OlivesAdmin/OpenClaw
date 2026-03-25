"use client";

import { Wallet, ReceiptText, CreditCard, PiggyBank, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";

interface SummaryCardsProps {
  totalCreditCard: number;
  selectedMonth: string;
}

export default function SummaryCards({ totalCreditCard }: SummaryCardsProps) {
  const totalFixed    = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalFixed + totalCreditCard;
  const netSavings    = MONTHLY_SALARY - totalExpenses;
  const ccPct         = Math.min((totalCreditCard / CREDIT_CARD_BUDGET) * 100, 100);
  const overBudget    = totalCreditCard > CREDIT_CARD_BUDGET;
  const expensePct    = (totalExpenses / MONTHLY_SALARY) * 100;
  const savingsRate   = (netSavings / MONTHLY_SALARY) * 100;

  const cards = [
    {
      label: "Monthly Salary", sub: "Fixed income · SGD",
      value: formatCurrency(MONTHLY_SALARY),
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
      label: "CC Budget Used", sub: overBudget ? `${formatCurrency(totalCreditCard - CREDIT_CARD_BUDGET)} over limit` : `${formatCurrency(CREDIT_CARD_BUDGET - totalCreditCard)} left`,
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

  // Render 4 flat cards — parent grid handles the 4-column layout
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
            background: `linear-gradient(145deg, color-mix(in srgb, ${card.c1} 9%, rgba(12,18,40,0.98)) 0%, rgba(8,12,28,0.99) 100%)`,
            border: `1px solid ${card.c1}28`,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, 0 16px 48px rgba(0,0,0,0.65), 0 0 32px ${card.c1}0e`,
            transition: "transform 0.25s, box-shadow 0.25s",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = "translateY(-3px)";
            el.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.06) inset, 0 24px 64px rgba(0,0,0,0.75), 0 0 48px ${card.c1}18`;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = "translateY(0)";
            el.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.04) inset, 0 16px 48px rgba(0,0,0,0.65), 0 0 32px ${card.c1}0e`;
          }}
        >
          {/* Top accent */}
          <div style={{
            height: "4px",
            background: `linear-gradient(90deg, ${card.c1}, ${card.c2})`,
            boxShadow: `0 0 18px ${card.c1}cc, 0 0 36px ${card.c1}50`,
          }} />

          <div style={{ padding: "18px 20px 20px" }}>
            {/* Icon + trend */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "13px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `linear-gradient(135deg, ${card.c1}22, ${card.c2}10)`,
                border: `1px solid ${card.c1}2a`,
                boxShadow: `0 4px 14px ${card.c1}20`,
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
              fontSize: "clamp(1.45rem, 2.2vw, 2rem)",
              fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1,
              color: card.c1, textShadow: `0 0 32px ${card.c1}55`,
              fontVariantNumeric: "tabular-nums",
            }}>
              {card.value}
            </div>

            <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", marginTop: "8px" }}>{card.label}</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>{card.sub}</div>

            {/* Progress */}
            <div style={{ marginTop: "14px" }}>
              <div style={{ height: "4px", borderRadius: "9999px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div className="progress-bar-fill" style={{
                  height: "100%", borderRadius: "9999px", width: `${card.progress}%`,
                  background: `linear-gradient(90deg, ${card.c1}, ${card.c2})`,
                  boxShadow: `0 0 8px ${card.c1}70`,
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "5px" }}>
                <span style={{ fontSize: "10px", color: "#334155", fontVariantNumeric: "tabular-nums" }}>{card.progress.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
