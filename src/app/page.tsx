"use client";

import { useMemo } from "react";
import Background from "@/components/Background";
import SummaryCards from "@/components/SummaryCards";
import FixedExpenses from "@/components/FixedExpenses";
import BudgetTracker from "@/components/BudgetTracker";
import StatementUpload from "@/components/StatementUpload";
import CreditCardExpenses from "@/components/CreditCardExpenses";
import Charts from "@/components/Charts";
import SavingsGauge from "@/components/SavingsGauge";
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

  const totalFixed  = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const netSavings  = MONTHLY_SALARY - totalFixed - totalCC;
  const savingsPct  = ((netSavings / MONTHLY_SALARY) * 100).toFixed(1);

  const segments = [
    { label: "Rental",  value: 6300,                              color: "#6366f1" },
    { label: "Utility", value: 600,                               color: "#f59e0b" },
    { label: "Helper",  value: 800,                               color: "#10b981" },
    { label: "CC",      value: totalCC,                           color: "#ec4899" },
    { label: "Savings", value: Math.max(MONTHLY_SALARY - totalFixed - totalCC, 0), color: "#22d3ee" },
  ];

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060912" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 0 40px rgba(99,102,241,0.6)",
            }}>
              <Gem size={22} style={{ color: "#fff" }} />
            </div>
          </div>
          <p style={{ fontSize: "11px", color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <Background />

      <div style={{ position: "relative", zIndex: 10 }}>
        {/* ── Header ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 20,
          padding: "16px 40px 14px",
          background: "rgba(6,9,18,0.92)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 0 28px rgba(99,102,241,0.55), 0 4px 16px rgba(0,0,0,0.3)",
                  }}>
                    <Gem size={19} style={{ color: "#fff" }} />
                  </div>
                  <Sparkles size={10} style={{ position: "absolute", top: "-3px", right: "-3px", color: "#fbbf24" }} />
                </div>
                <div>
                  <h1 style={{
                    fontSize: "17px", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1,
                    background: "linear-gradient(135deg, #a5b4fc, #818cf8, #c4b5fd)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>OpenClaw</h1>
                  <p style={{ fontSize: "10px", color: "#475569", marginTop: "2px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Finance OS</p>
                </div>
              </div>

              {/* Pills */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {[
                  { icon: <Wallet size={11} />, text: `${formatCurrency(MONTHLY_SALARY)}/mo`, c1: "#10b981", c2: "rgba(16,185,129,0.12)", b: "rgba(16,185,129,0.2)" },
                  { icon: <Target size={11} />,  text: `CC ${formatCurrency(CREDIT_CARD_BUDGET)}`,     c1: "#6366f1", c2: "rgba(99,102,241,0.12)",  b: "rgba(99,102,241,0.2)"  },
                  { icon: <Activity size={10} />, text: `${savingsPct}% saved`,                          c1: "#22d3ee", c2: "rgba(34,211,238,0.1)",   b: "rgba(34,211,238,0.18)" },
                ].map((pill, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "6px 12px", borderRadius: "9999px",
                    background: pill.c2, border: `1px solid ${pill.b}`,
                  }}>
                    <span style={{ color: pill.c1 }}>{pill.icon}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: pill.c1 }}>{pill.text}</span>
                  </div>
                ))}
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px", borderRadius: "9999px",
                  background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)",
                }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", letterSpacing: "0.08em" }}>LIVE</span>
                </div>
              </div>
            </div>

            {/* Allocation bar */}
            <div style={{
              marginTop: "14px", borderRadius: "16px", padding: "12px 18px",
              background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569" }}>Monthly Allocation</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", fontVariantNumeric: "tabular-nums" }}>SGD {MONTHLY_SALARY.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", height: "6px", borderRadius: "9999px", overflow: "hidden", gap: "2px" }}>
                {segments.map((seg) => {
                  const pct = (seg.value / MONTHLY_SALARY) * 100;
                  return pct > 0.5 ? (
                    <div key={seg.label} style={{
                      height: "100%", width: `${pct}%`,
                      background: seg.color, boxShadow: `0 0 10px ${seg.color}80`,
                      borderRadius: "9999px", transition: "width 0.7s ease",
                    }} title={`${seg.label}: ${formatCurrency(seg.value)}`} />
                  ) : null;
                })}
              </div>
              <div style={{ display: "flex", gap: "20px", marginTop: "8px", flexWrap: "wrap" }}>
                {segments.map((seg) => (
                  <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: seg.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "10px", color: "#475569", fontWeight: 500 }}>{seg.label}</span>
                    <span style={{ fontSize: "10px", color: "#334155", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(seg.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main style={{ padding: "28px 40px 64px", maxWidth: "1400px", margin: "0 auto" }}>

          {/* Row 1: Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
            <SummaryCards totalCreditCard={totalCC} selectedMonth={selectedMonth} />
          </div>

          {/* Row 2: Left = Charts + CC Expenses | Right = Gauge + Fixed + Upload */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px", marginBottom: "20px" }}>

            {/* LEFT column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
              <Charts expenses={creditCardExpenses} />
              <CreditCardExpenses
                statements={statements}
                expenses={creditCardExpenses}
                selectedMonth={selectedMonth}
                onRemoveStatement={removeStatement}
                onUpdateCategory={updateExpenseCategory}
                onMonthChange={setSelectedMonth}
              />
            </div>

            {/* RIGHT column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <SavingsGauge totalCC={totalCC} />
              <FixedExpenses />
              <BudgetTracker expenses={creditCardExpenses} />
              <StatementUpload onUpload={addStatement} />
            </div>
          </div>

          {/* Row 3: Overall Summary — full width */}
          <OverallSummary totalCreditCard={totalCC} />
        </main>
      </div>
    </div>
  );
}
