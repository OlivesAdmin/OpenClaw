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
import { Gem, Wallet, Target, Activity, Sparkles } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050810" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 32px rgba(99,102,241,0.5)" }}>
              <Gem size={22} className="text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping"
              style={{ background: "rgba(99,102,241,0.3)" }} />
          </div>
          <p className="text-xs text-slate-500 tracking-widest uppercase font-semibold">Loading</p>
        </div>
      </div>
    );
  }

  const segments = [
    { label: "Rental",  value: 6300,       color: "#6366f1" },
    { label: "Utility", value: 600,        color: "#f59e0b" },
    { label: "Helper",  value: 800,        color: "#10b981" },
    { label: "CC",      value: totalCC,    color: "#ec4899" },
    { label: "Savings", value: Math.max(MONTHLY_SALARY - totalFixed - totalCC, 0), color: "#22d3ee" },
  ];

  return (
    <div className="relative min-h-screen">
      <Background />

      <div className="relative z-10">
        {/* ── Header ── */}
        <header
          className="sticky top-0 z-20 px-5 md:px-10 pt-4 pb-3"
          style={{
            background: "rgba(5,8,16,0.88)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4">

              {/* Logo */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      boxShadow: "0 0 24px rgba(99,102,241,0.5), 0 4px 16px rgba(0,0,0,0.3)",
                    }}
                  >
                    <Gem size={18} className="text-white" />
                  </div>
                  <Sparkles size={10} className="absolute -top-1 -right-1 text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-base font-black gradient-text leading-none tracking-tight">OpenClaw</h1>
                  <p className="text-[10px] text-slate-600 mt-0.5 font-medium tracking-wider uppercase">Finance OS</p>
                </div>
              </div>

              {/* Right pills */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <div
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  <Wallet size={11} className="text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 stat-value">{formatCurrency(MONTHLY_SALARY)}<span className="font-normal text-emerald-600">/mo</span></span>
                </div>

                <div
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.06))",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                >
                  <Target size={11} className="text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-400">CC <span className="text-indigo-300">{formatCurrency(CREDIT_CARD_BUDGET)}</span></span>
                </div>

                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                  style={{
                    background: "rgba(52,211,153,0.08)",
                    border: "1px solid rgba(52,211,153,0.18)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-ring inline-block" />
                  <Activity size={10} className="text-emerald-500" />
                  <span className="text-[11px] text-emerald-500 font-bold tracking-wider">LIVE</span>
                </div>
              </div>
            </div>

            {/* Allocation bar */}
            <div
              className="mt-3 rounded-2xl px-5 py-3"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="section-label">Monthly Allocation</span>
                  <div className="h-px w-12" style={{ background: "rgba(255,255,255,0.08)" }} />
                </div>
                <span className="text-xs font-bold text-slate-400 stat-value">SGD {MONTHLY_SALARY.toLocaleString()}</span>
              </div>

              <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
                {segments.map((seg) => {
                  const pct = (seg.value / MONTHLY_SALARY) * 100;
                  return pct > 0.5 ? (
                    <div
                      key={seg.label}
                      className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: seg.color, boxShadow: `0 0 8px ${seg.color}80` }}
                      title={`${seg.label}: ${formatCurrency(seg.value)}`}
                    />
                  ) : null;
                })}
              </div>

              <div className="flex items-center gap-5 mt-2.5 flex-wrap">
                {segments.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: seg.color }} />
                    <span className="text-[10px] text-slate-500 font-medium">{seg.label}</span>
                    <span className="text-[10px] text-slate-600 tabular-nums">{formatCurrency(seg.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="px-5 md:px-10 pb-16 pt-7">
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
