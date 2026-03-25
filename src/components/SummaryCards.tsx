"use client";

import { Wallet, ReceiptText, CreditCard, PiggyBank, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";

interface SummaryCardsProps {
  totalCreditCard: number;
  selectedMonth: string;
}

export default function SummaryCards({ totalCreditCard }: SummaryCardsProps) {
  const totalFixed   = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalFixed + totalCreditCard;
  const netSavings   = MONTHLY_SALARY - totalExpenses;
  const ccBudgetUsed = (totalCreditCard / CREDIT_CARD_BUDGET) * 100;
  const overBudget   = totalCreditCard > CREDIT_CARD_BUDGET;
  const expensePct   = (totalExpenses  / MONTHLY_SALARY) * 100;
  const savingsRate  = (netSavings     / MONTHLY_SALARY) * 100;

  const cards = [
    {
      label: "Monthly Salary",
      value: formatCurrency(MONTHLY_SALARY),
      sub: "Fixed income · SGD",
      Icon: Wallet,
      TrendIcon: TrendingUp,
      trendText: "Stable",
      trendUp: true,
      color1: "#10b981",
      color2: "#06b6d4",
      progress: 100,
      progressLabel: "Full income",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(totalExpenses),
      sub: `${expensePct.toFixed(1)}% of income`,
      Icon: ReceiptText,
      TrendIcon: expensePct > 80 ? TrendingUp : TrendingDown,
      trendText: expensePct > 80 ? "High" : "Controlled",
      trendUp: expensePct <= 80,
      color1: expensePct > 90 ? "#ef4444" : "#f97316",
      color2: expensePct > 90 ? "#f87171" : "#fbbf24",
      progress: Math.min(expensePct, 100),
      progressLabel: `${expensePct.toFixed(0)}% of salary`,
    },
    {
      label: "CC Budget Used",
      value: `${Math.min(ccBudgetUsed, 100).toFixed(1)}%`,
      sub: overBudget
        ? `${formatCurrency(totalCreditCard - CREDIT_CARD_BUDGET)} over`
        : `${formatCurrency(CREDIT_CARD_BUDGET - totalCreditCard)} left`,
      Icon: overBudget ? AlertTriangle : CreditCard,
      TrendIcon: overBudget ? TrendingUp : TrendingDown,
      trendText: overBudget ? "Over" : "On track",
      trendUp: !overBudget,
      color1: overBudget ? "#ef4444" : "#6366f1",
      color2: overBudget ? "#f97316" : "#8b5cf6",
      progress: Math.min(ccBudgetUsed, 100),
      progressLabel: `${ccBudgetUsed.toFixed(0)}% used`,
    },
    {
      label: "Net Savings",
      value: formatCurrency(Math.abs(netSavings)),
      sub: netSavings >= 0 ? "Great month!" : "Exceeds income",
      Icon: PiggyBank,
      TrendIcon: netSavings >= 0 ? TrendingUp : TrendingDown,
      trendText: netSavings >= 0 ? `${savingsRate.toFixed(1)}%` : "Deficit",
      trendUp: netSavings >= 0,
      color1: netSavings >= 0 ? "#fbbf24" : "#ef4444",
      color2: netSavings >= 0 ? "#f59e0b" : "#f97316",
      progress: Math.max(0, Math.min(savingsRate, 100)),
      progressLabel: `${Math.max(0, savingsRate).toFixed(0)}% rate`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="stat-card rounded-3xl overflow-hidden fade-in-up cursor-default"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          {/* Top gradient accent stripe */}
          <div
            className="h-[3px] w-full"
            style={{
              background: `linear-gradient(90deg, ${card.color1}, ${card.color2})`,
              boxShadow: `0 0 16px ${card.color1}80`,
            }}
          />

          <div className="p-5">
            {/* Icon row */}
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${card.color1}18, ${card.color2}10)`,
                  border: `1px solid ${card.color1}28`,
                  boxShadow: `0 4px 16px ${card.color1}20`,
                }}
              >
                <card.Icon size={19} style={{ color: card.color1 }} />
              </div>

              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{
                  background: card.trendUp ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${card.trendUp ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}
              >
                <card.TrendIcon size={9} style={{ color: card.trendUp ? "#10b981" : "#ef4444" }} />
                <span
                  className="text-[10px] font-bold tracking-wide"
                  style={{ color: card.trendUp ? "#10b981" : "#ef4444" }}
                >
                  {card.trendText}
                </span>
              </div>
            </div>

            {/* Main value */}
            <div
              className="text-[1.85rem] font-black leading-none stat-value"
              style={{
                color: card.color1,
                letterSpacing: "-0.04em",
                textShadow: `0 0 32px ${card.color1}40`,
              }}
            >
              {card.value}
            </div>

            {/* Label */}
            <div className="mt-2.5 text-[13px] font-semibold text-slate-200">{card.label}</div>
            <div className="mt-0.5 text-[11px] text-slate-500">{card.sub}</div>

            {/* Progress bar */}
            <div className="mt-4">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full progress-bar-fill"
                  style={{
                    width: `${card.progress}%`,
                    background: `linear-gradient(90deg, ${card.color1}, ${card.color2})`,
                    boxShadow: `0 0 8px ${card.color1}60`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-slate-600">0%</span>
                <span className="text-[10px] text-slate-500 tabular-nums">{card.progressLabel}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
