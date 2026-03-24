"use client";

import { useMemo } from "react";
import Background from "@/components/Background";
import SummaryCards from "@/components/SummaryCards";
import FixedExpenses from "@/components/FixedExpenses";
import BudgetTracker from "@/components/BudgetTracker";
import StatementUpload from "@/components/StatementUpload";
import CreditCardExpenses from "@/components/CreditCardExpenses";
import ExpenseChart from "@/components/ExpenseChart";
import OverallSummary from "@/components/OverallSummary";
import { useAppStore, MONTHLY_SALARY, FIXED_EXPENSES, CREDIT_CARD_BUDGET } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Gem, Wallet, Target, Activity } from "lucide-react";

export default function Dashboard() {
  const {
    statements,
    creditCardExpenses,
    selectedMonth,
    isLoaded,
    addStatement,
    removeStatement,
    setSelectedMonth,
    updateExpenseCategory,
  } = useAppStore();

  const totalCC = useMemo(
    () => creditCardExpenses.reduce((s, e) => s + e.amount, 0),
    [creditCardExpenses]
  );

  const totalFixed = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const segments = [
    { label: "Rental", value: 6300, color: "#6366f1" },
    { label: "Utility", value: 600, color: "#f59e0b" },
    { label: "Helper", value: 800, color: "#10b981" },
    { label: "CC Spent", value: totalCC, color: "#ec4899" },
    { label: "Savings", value: Math.max(MONTHLY_SALARY - totalFixed - totalCC, 0), color: "#22d3ee" },
  ];

  return (
    <div className="relative min-h-screen">
      <Background />

      <div className="relative z-10">
        {/* ── Header ── */}
        <header className="sticky top-0 z-20 px-4 md:px-8 pt-5 pb-4"
          style={{ background: "rgba(6,11,24,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
                >
                  <Gem size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold gradient-text leading-none">OpenClaw</h1>
                  <p className="text-[11px] text-slate-500 mt-0.5">Personal Finance</p>
                </div>
              </div>

              {/* Pills */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <Wallet size={12} className="text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">{formatCurrency(MONTHLY_SALARY)}/mo</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <Target size={12} className="text-indigo-400" />
                  <span className="text-xs font-medium text-indigo-400">CC: {formatCurrency(CREDIT_CARD_BUDGET)}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                  style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-ring inline-block" />
                  <Activity size={11} className="text-emerald-500" />
                  <span className="text-xs text-emerald-500 font-medium">Live</span>
                </div>
              </div>
            </div>

            {/* Allocation bar */}
            <div className="mt-4 glass rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="section-label">Monthly Allocation</span>
                <span className="text-xs text-slate-500 tabular-nums">SGD {MONTHLY_SALARY.toLocaleString()}</span>
              </div>
              <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
                {segments.map((seg) => {
                  const pct = (seg.value / MONTHLY_SALARY) * 100;
                  return pct > 0.5 ? (
                    <div
                      key={seg.label}
                      className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: seg.color }}
                      title={`${seg.label}: ${formatCurrency(seg.value)}`}
                    />
                  ) : null;
                })}
              </div>
              <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                {segments.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{ background: seg.color }} />
                    <span className="text-[11px] text-slate-500">{seg.label}</span>
                    <span className="text-[11px] text-slate-600 tabular-nums">{formatCurrency(seg.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="px-4 md:px-8 pb-14 pt-6">
          <div className="max-w-7xl mx-auto space-y-5">
            <SummaryCards totalCreditCard={totalCC} selectedMonth={selectedMonth} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StatementUpload onUpload={addStatement} />
              <FixedExpenses />
              <BudgetTracker expenses={creditCardExpenses} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3">
                <CreditCardExpenses
                  statements={statements}
                  expenses={creditCardExpenses}
                  selectedMonth={selectedMonth}
                  onRemoveStatement={removeStatement}
                  onUpdateCategory={updateExpenseCategory}
                  onMonthChange={setSelectedMonth}
                />
              </div>
              <div className="lg:col-span-2">
                <ExpenseChart expenses={creditCardExpenses} />
              </div>
            </div>

            <OverallSummary totalCreditCard={totalCC} />
          </div>
        </main>
      </div>
    </div>
  );
}
