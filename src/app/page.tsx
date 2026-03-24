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
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Background />

      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 md:px-8 pt-6 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                  }}
                >
                  💎
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">OpenClaw</h1>
                  <p className="text-xs text-slate-500">Personal Finance Dashboard</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}
                >
                  <span>💰</span>
                  <span>{formatCurrency(MONTHLY_SALARY)}/mo</span>
                </div>
                <div
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" }}
                >
                  <span>🎯</span>
                  <span>CC Budget: {formatCurrency(CREDIT_CARD_BUDGET)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-ring inline-block" />
                  <span>Live</span>
                </div>
              </div>
            </div>

            {/* Income allocation bar */}
            <div className="mt-4 glass rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">Monthly Allocation</span>
                <span className="text-xs text-slate-500">SGD {MONTHLY_SALARY.toLocaleString()}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                {[
                  { label: "Rental", value: 6300, color: "#6366f1" },
                  { label: "Utility", value: 600, color: "#f59e0b" },
                  { label: "Helper", value: 800, color: "#10b981" },
                  { label: "CC Spent", value: totalCC, color: "#ec4899" },
                  { label: "Savings", value: Math.max(MONTHLY_SALARY - totalFixed - totalCC, 0), color: "#22d3ee" },
                ].map((seg) => {
                  const pct = (seg.value / MONTHLY_SALARY) * 100;
                  return pct > 0 ? (
                    <div
                      key={seg.label}
                      className="h-full rounded-sm transition-all duration-700"
                      style={{ width: `${pct}%`, background: seg.color, opacity: 0.85 }}
                      title={`${seg.label}: ${formatCurrency(seg.value)}`}
                    />
                  ) : null;
                })}
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {[
                  { label: "Rental", color: "#6366f1" },
                  { label: "Utility", color: "#f59e0b" },
                  { label: "Helper", color: "#10b981" },
                  { label: "CC", color: "#ec4899" },
                  { label: "Savings", color: "#22d3ee" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-slate-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="px-4 md:px-8 pb-12">
          <div className="max-w-7xl mx-auto space-y-5">
            {/* Row 1: Summary cards */}
            <SummaryCards totalCreditCard={totalCC} selectedMonth={selectedMonth} />

            {/* Row 2: Upload + Fixed + Budget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StatementUpload onUpload={addStatement} />
              <FixedExpenses />
              <BudgetTracker expenses={creditCardExpenses} />
            </div>

            {/* Row 3: CC Expenses + Charts */}
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

            {/* Row 4: Overall Summary */}
            <OverallSummary totalCreditCard={totalCC} />
          </div>
        </main>
      </div>
    </div>
  );
}
