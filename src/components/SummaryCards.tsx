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

  const cards = [
    {
      label: "Monthly Salary",
      value: formatCurrency(MONTHLY_SALARY),
      sub: "Fixed income · SGD",
      Icon: Wallet,
      TrendIcon: TrendingUp,
      trendText: "Stable",
      trendPositive: true,
      color: "#10b981",
      iconBg: "rgba(16,185,129,0.12)",
      borderGlow: "rgba(16,185,129,0.15)",
      topBar: "#10b981",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(totalExpenses),
      sub: `${expensePct.toFixed(1)}% of income`,
      Icon: ReceiptText,
      TrendIcon: expensePct > 80 ? TrendingUp : TrendingDown,
      trendText: expensePct > 80 ? "High spend" : "In control",
      trendPositive: expensePct <= 80,
      color: expensePct > 90 ? "#ef4444" : "#f97316",
      iconBg: expensePct > 90 ? "rgba(239,68,68,0.12)" : "rgba(249,115,22,0.12)",
      borderGlow: expensePct > 90 ? "rgba(239,68,68,0.15)" : "rgba(249,115,22,0.15)",
      topBar: expensePct > 90 ? "#ef4444" : "#f97316",
    },
    {
      label: "CC Budget Used",
      value: `${Math.min(ccBudgetUsed, 100).toFixed(1)}%`,
      sub: overBudget
        ? `${formatCurrency(totalCreditCard - CREDIT_CARD_BUDGET)} over target`
        : `${formatCurrency(CREDIT_CARD_BUDGET - totalCreditCard)} remaining`,
      Icon: overBudget ? AlertTriangle : CreditCard,
      TrendIcon: overBudget ? TrendingUp : TrendingDown,
      trendText: overBudget ? "Over budget" : "On track",
      trendPositive: !overBudget,
      color: overBudget ? "#ef4444" : "#6366f1",
      iconBg: overBudget ? "rgba(239,68,68,0.12)" : "rgba(99,102,241,0.12)",
      borderGlow: overBudget ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)",
      topBar: overBudget ? "#ef4444" : "#6366f1",
    },
    {
      label: "Net Savings",
      value: formatCurrency(Math.abs(netSavings)),
      sub: netSavings >= 0 ? "Great job this month!" : "Exceeds income",
      Icon: PiggyBank,
      TrendIcon: netSavings >= 0 ? TrendingUp : TrendingDown,
      trendText: netSavings >= 0 ? `${((netSavings / MONTHLY_SALARY) * 100).toFixed(1)}% rate` : "Deficit",
      trendPositive: netSavings >= 0,
      color: netSavings >= 0 ? "#10b981" : "#ef4444",
      iconBg: netSavings >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
      borderGlow: netSavings >= 0 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
      topBar: netSavings >= 0 ? "#10b981" : "#ef4444",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="glass glass-hover rounded-2xl overflow-hidden fade-in-up"
          style={{
            animationDelay: `${i * 0.07}s`,
            boxShadow: `0 0 0 1px ${card.borderGlow}, 0 4px 24px rgba(0,0,0,0.2)`,
          }}
        >
          {/* Color top strip */}
          <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${card.topBar}, transparent)` }} />

          <div className="p-5">
            {/* Icon + trend */}
            <div className="flex items-start justify-between mb-4">
              <div
                className="icon-box w-10 h-10"
                style={{ background: card.iconBg }}
              >
                <card.Icon size={18} style={{ color: card.color }} />
              </div>
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{
                  background: card.trendPositive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                }}
              >
                <card.TrendIcon
                  size={10}
                  style={{ color: card.trendPositive ? "#10b981" : "#ef4444" }}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: card.trendPositive ? "#10b981" : "#ef4444" }}
                >
                  {card.trendText}
                </span>
              </div>
            </div>

            {/* Value */}
            <div
              className="text-2xl font-bold stat-value mb-0.5"
              style={{ color: card.color }}
            >
              {card.value}
            </div>

            {/* Label */}
            <div className="text-xs font-semibold text-slate-300 mb-0.5">{card.label}</div>
            <div className="text-[11px] text-slate-500">{card.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
