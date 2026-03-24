"use client";

import { formatCurrency } from "@/lib/utils";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";

interface SummaryCardsProps {
  totalCreditCard: number;
  selectedMonth: string;
}

export default function SummaryCards({ totalCreditCard, selectedMonth }: SummaryCardsProps) {
  const totalFixed = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalFixed + totalCreditCard;
  const netSavings = MONTHLY_SALARY - totalExpenses;
  const ccBudgetUsed = (totalCreditCard / CREDIT_CARD_BUDGET) * 100;
  const overBudget = totalCreditCard > CREDIT_CARD_BUDGET;

  const cards = [
    {
      label: "Monthly Salary",
      value: formatCurrency(MONTHLY_SALARY),
      sub: "Fixed income",
      icon: "💰",
      color: "#10b981",
      glow: "glow-green",
      accent: "rgba(16,185,129,0.15)",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(totalExpenses),
      sub: `${((totalExpenses / MONTHLY_SALARY) * 100).toFixed(1)}% of salary`,
      icon: "📊",
      color: "#f97316",
      glow: "glow-red",
      accent: "rgba(249,115,22,0.12)",
    },
    {
      label: "CC Budget Used",
      value: `${Math.min(ccBudgetUsed, 100).toFixed(1)}%`,
      sub: overBudget
        ? `${formatCurrency(totalCreditCard - CREDIT_CARD_BUDGET)} over budget`
        : `${formatCurrency(CREDIT_CARD_BUDGET - totalCreditCard)} remaining`,
      icon: overBudget ? "⚠️" : "💳",
      color: overBudget ? "#ef4444" : "#6366f1",
      glow: overBudget ? "glow-red" : "glow-purple",
      accent: overBudget ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.12)",
    },
    {
      label: "Net Savings",
      value: formatCurrency(Math.abs(netSavings)),
      sub: netSavings >= 0 ? "Great job saving!" : "Over your income!",
      icon: netSavings >= 0 ? "🚀" : "🔴",
      color: netSavings >= 0 ? "#10b981" : "#ef4444",
      glow: netSavings >= 0 ? "glow-green" : "glow-red",
      accent: netSavings >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`glass glass-hover rounded-2xl p-5 ${card.glow} fade-in-up`}
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: card.accent }}
            >
              {card.icon}
            </div>
            <div
              className="w-2 h-2 rounded-full pulse-ring"
              style={{ background: card.color }}
            />
          </div>
          <div
            className="text-2xl font-bold mb-1"
            style={{ color: card.color }}
          >
            {card.value}
          </div>
          <div className="text-xs text-slate-400 font-medium">{card.label}</div>
          <div className="text-xs text-slate-500 mt-1">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
