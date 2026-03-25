"use client";

import { Wallet, ReceiptText, CreditCard, PiggyBank, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";
import { GlowCard } from "@/components/ui/spotlight-card";

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
      glowColor: "green" as const,
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
      glowColor: expensePct > 90 ? ("red" as const) : ("orange" as const),
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
      glowColor: overBudget ? ("red" as const) : ("blue" as const),
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
      glowColor: netSavings >= 0 ? ("gold" as const) : ("red" as const),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <GlowCard
          key={i}
          glowColor={card.glowColor}
          customSize
          className="fade-in-up w-full h-full"
          style={{ animationDelay: `${i * 0.07}s` } as React.CSSProperties}
        >
          {/* Bold left accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
            style={{ background: `linear-gradient(180deg, ${card.accentColor}, ${card.accentColor}66)` }}
          />

          <div className="pl-5 pr-4 pt-4 pb-4 flex flex-col h-full">
            {/* Icon + trend row */}
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${card.accentColor}14`,
                  border: `1px solid ${card.accentColor}40`,
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
        </GlowCard>
      ))}
    </div>
  );
}
