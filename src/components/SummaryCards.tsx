"use client";

import { Wallet, ReceiptText, CreditCard, PiggyBank, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";

interface SummaryCardsProps {
  totalCreditCard: number;
  selectedMonth: string;
}

export default function SummaryCards({ totalCreditCard }: SummaryCardsProps) {
  const totalFixed = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalFixed + totalCreditCard;
  const netSavings = MONTHLY_SALARY - totalExpenses;
  const ccBudgetUsed = (totalCreditCard / CREDIT_CARD_BUDGET) * 100;
  const overBudget = totalCreditCard > CREDIT_CARD_BUDGET;
  const expensePct = (totalExpenses / MONTHLY_SALARY) * 100;
  const savingsRate = (netSavings / MONTHLY_SALARY) * 100;

  const cards = [
    {
      label: "Monthly Salary",
      value: formatCurrency(MONTHLY_SALARY),
      sub: "Fixed income · SGD",
      Icon: Wallet,
      TrendIcon: TrendingUp,
      trendText: "Stable",
      trendUp: true,
      accentColor: "#10b981",
      accentBg: "rgba(16,185,129,0.08)",
      accentBorder: "rgba(16,185,129,0.25)",
      cardBg: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.04) 100%)",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(totalExpenses),
      sub: `${expensePct.toFixed(1)}% of income`,
      Icon: ReceiptText,
      TrendIcon: expensePct > 80 ? TrendingUp : TrendingDown,
      trendText: expensePct > 80 ? "High spend" : "Controlled",
      trendUp: expensePct <= 80,
      accentColor: expensePct > 90 ? "#ef4444" : "#f97316",
      accentBg: expensePct > 90 ? "rgba(239,68,68,0.08)" : "rgba(249,115,22,0.08)",
      accentBorder: expensePct > 90 ? "rgba(239,68,68,0.3)" : "rgba(249,115,22,0.3)",
      cardBg: expensePct > 90
        ? "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(249,115,22,0.04) 100%)"
        : "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(251,191,36,0.04) 100%)",
    },
    {
      label: "CC Budget Used",
      value: `${Math.min(ccBudgetUsed, 100).toFixed(1)}%`,
      sub: overBudget
        ? `${formatCurrency(totalCreditCard - CREDIT_CARD_BUDGET)} over target`
        : `${formatCurrency(CREDIT_CARD_BUDGET - totalCreditCard)} left`,
      Icon: overBudget ? AlertTriangle : CreditCard,
      TrendIcon: overBudget ? TrendingUp : TrendingDown,
      trendText: overBudget ? "Over budget" : "On track",
      trendUp: !overBudget,
      accentColor: overBudget ? "#ef4444" : "#6366f1",
      accentBg: overBudget ? "rgba(239,68,68,0.08)" : "rgba(99,102,241,0.08)",
      accentBorder: overBudget ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)",
      cardBg: overBudget
        ? "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.03) 100%)"
        : "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)",
    },
    {
      label: "Net Savings",
      value: formatCurrency(Math.abs(netSavings)),
      sub: netSavings >= 0 ? "Great job this month!" : "Exceeds income",
      Icon: PiggyBank,
      TrendIcon: netSavings >= 0 ? TrendingUp : TrendingDown,
      trendText: netSavings >= 0 ? `${savingsRate.toFixed(1)}% rate` : "Deficit",
      trendUp: netSavings >= 0,
      accentColor: netSavings >= 0 ? "#10b981" : "#ef4444",
      accentBg: netSavings >= 0 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
      accentBorder: netSavings >= 0 ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.3)",
      cardBg: netSavings >= 0
        ? "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.04) 100%)"
        : "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(249,115,22,0.04) 100%)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden fade-in-up relative"
          style={{
            animationDelay: `${i * 0.07}s`,
            background: card.cardBg,
            border: `1px solid ${card.accentBorder}`,
            boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
        >
          {/* Bold left accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
            style={{ background: `linear-gradient(180deg, ${card.accentColor}, ${card.accentColor}66)` }}
          />

          <div className="pl-5 pr-4 pt-4 pb-4">
            {/* Icon + trend row */}
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: card.accentBg,
                  border: `1px solid ${card.accentBorder}`,
                  boxShadow: `0 0 16px ${card.accentColor}20`,
                }}
              >
                <card.Icon size={20} style={{ color: card.accentColor }} />
              </div>

              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{
                  background: card.trendUp ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                  border: `1px solid ${card.trendUp ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}
              >
                <card.TrendIcon size={10} style={{ color: card.trendUp ? "#10b981" : "#ef4444" }} />
                <span className="text-[10px] font-semibold" style={{ color: card.trendUp ? "#10b981" : "#ef4444" }}>
                  {card.trendText}
                </span>
              </div>
            </div>

            {/* Main value */}
            <div
              className="text-[1.7rem] font-extrabold leading-none mb-1.5 stat-value"
              style={{ color: card.accentColor, letterSpacing: "-0.03em" }}
            >
              {card.value}
            </div>

            {/* Label */}
            <div className="text-[13px] font-semibold text-slate-200 mb-0.5">{card.label}</div>
            <div className="text-[11px] text-slate-500">{card.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
