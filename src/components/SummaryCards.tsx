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
      label: "Monthly Salary",
      value: formatCurrency(MONTHLY_SALARY),
      sub: "Fixed income · SGD",
      Icon: Wallet,
      TrendIcon: TrendingUp,
      trendText: "Stable",
      trendGood: true,
      c1: "#10b981", c2: "#34d399",
      progress: 100,
      progressLabel: "100%",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(totalExpenses),
      sub: `${expensePct.toFixed(1)}% of income`,
      Icon: ReceiptText,
      TrendIcon: expensePct > 80 ? TrendingUp : TrendingDown,
      trendText: expensePct > 80 ? "High" : "Controlled",
      trendGood: expensePct <= 80,
      c1: expensePct > 90 ? "#ef4444" : "#f97316", c2: expensePct > 90 ? "#f87171" : "#fbbf24",
      progress: Math.min(expensePct, 100),
      progressLabel: `${expensePct.toFixed(0)}%`,
    },
    {
      label: "CC Budget Used",
      value: `${ccPct.toFixed(1)}%`,
      sub: overBudget ? `${formatCurrency(totalCreditCard - CREDIT_CARD_BUDGET)} over limit` : `${formatCurrency(CREDIT_CARD_BUDGET - totalCreditCard)} remaining`,
      Icon: overBudget ? AlertTriangle : CreditCard,
      TrendIcon: overBudget ? TrendingUp : TrendingDown,
      trendText: overBudget ? "Over" : "On Track",
      trendGood: !overBudget,
      c1: overBudget ? "#ef4444" : "#6366f1", c2: overBudget ? "#f97316" : "#8b5cf6",
      progress: ccPct,
      progressLabel: `${ccPct.toFixed(0)}%`,
    },
    {
      label: "Net Savings",
      value: formatCurrency(Math.abs(netSavings)),
      sub: netSavings >= 0 ? "Keep it up!" : "Over income",
      Icon: PiggyBank,
      TrendIcon: netSavings >= 0 ? TrendingUp : TrendingDown,
      trendText: `${Math.max(0, savingsRate).toFixed(1)}% rate`,
      trendGood: netSavings >= 0,
      c1: netSavings >= 0 ? "#f59e0b" : "#ef4444", c2: netSavings >= 0 ? "#fbbf24" : "#f97316",
      progress: Math.max(0, Math.min(savingsRate, 100)),
      progressLabel: `${Math.max(0, savingsRate).toFixed(0)}%`,
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}
      className="lg:grid-cols-4"
    >
      <style>{`@media (min-width: 1024px) { .summary-grid { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
      {cards.map((card, i) => (
        <div
          key={i}
          className="fade-in-up"
          style={{
            animationDelay: `${i * 0.08}s`,
            borderRadius: "24px",
            overflow: "hidden",
            background: `linear-gradient(145deg, color-mix(in srgb, ${card.c1} 10%, rgba(12,18,38,0.98)) 0%, rgba(8,12,28,0.99) 100%)`,
            border: `1px solid ${card.c1}30`,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${card.c1}10`,
            transition: "transform 0.25s, box-shadow 0.25s",
            cursor: "default",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px rgba(255,255,255,0.06) inset, 0 28px 80px rgba(0,0,0,0.8), 0 0 60px ${card.c1}18`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${card.c1}10`;
          }}
        >
          {/* Top accent strip */}
          <div style={{
            height: "4px",
            background: `linear-gradient(90deg, ${card.c1}, ${card.c2})`,
            boxShadow: `0 0 20px ${card.c1}cc, 0 0 40px ${card.c1}60`,
          }} />

          <div style={{ padding: "20px 22px 22px" }}>
            {/* Icon + trend */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
              <div style={{
                width: "46px", height: "46px", borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                background: `linear-gradient(135deg, ${card.c1}22, ${card.c2}12)`,
                border: `1px solid ${card.c1}30`,
                boxShadow: `0 4px 16px ${card.c1}22`,
              }}>
                <card.Icon size={20} style={{ color: card.c1 }} />
              </div>

              <div style={{
                display: "flex", alignItems: "center", gap: "4px",
                padding: "4px 10px", borderRadius: "9999px",
                background: card.trendGood ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                border: `1px solid ${card.trendGood ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}>
                <card.TrendIcon size={9} style={{ color: card.trendGood ? "#10b981" : "#ef4444" }} />
                <span style={{
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.03em",
                  color: card.trendGood ? "#10b981" : "#ef4444",
                }}>
                  {card.trendText}
                </span>
              </div>
            </div>

            {/* Value */}
            <div style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              color: card.c1,
              textShadow: `0 0 40px ${card.c1}60`,
              fontVariantNumeric: "tabular-nums",
            }}>
              {card.value}
            </div>

            {/* Label */}
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", marginTop: "10px" }}>{card.label}</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>{card.sub}</div>

            {/* Progress */}
            <div style={{ marginTop: "16px" }}>
              <div style={{ height: "4px", borderRadius: "9999px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    height: "100%", borderRadius: "9999px",
                    width: `${card.progress}%`,
                    background: `linear-gradient(90deg, ${card.c1}, ${card.c2})`,
                    boxShadow: `0 0 10px ${card.c1}80`,
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <span style={{ fontSize: "10px", color: "#334155" }}>0%</span>
                <span style={{ fontSize: "10px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>{card.progressLabel}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
