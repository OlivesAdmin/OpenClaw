"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { TrendingUp, Target, PieChart as PieIcon, BarChart2 } from "lucide-react";
import { useState } from "react";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";
import { CreditCardExpense, CATEGORY_COLORS } from "@/lib/types";
import { groupByCategory, formatCurrency } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

interface ChartsProps {
  expenses: CreditCardExpense[];
}

function buildMonthlyData(currentCC: number) {
  const fixed = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const ccHistory = [7200, 6800, 9100, 7500, 8200, currentCC || 0];
  return months.map((month, i) => {
    const cc = ccHistory[i];
    const expenses = fixed + cc;
    const savings = MONTHLY_SALARY - expenses;
    return { month, income: MONTHLY_SALARY, expenses, savings: Math.max(savings, 0), cc };
  });
}

export default function Charts({ expenses }: ChartsProps) {
  const { theme, t } = useTheme();
  const [activeChart, setActiveChart] = useState<"allocation" | "trend" | "breakdown">("allocation");

  const totalCC    = expenses.reduce((s, e) => s + e.amount, 0);
  const totalFixed = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const netSavings = MONTHLY_SALARY - totalFixed - totalCC;
  const monthlyData = buildMonthlyData(totalCC);

  const allocationData = [
    ...FIXED_EXPENSES.map((e) => ({
      name: e.name, value: e.amount,
      color: e.name === "Rental" ? "#6366f1" : e.name === "Utility Bills" ? "#f59e0b" : "#10b981",
    })),
    { name: "CC Spend", value: totalCC || CREDIT_CARD_BUDGET, color: "#ec4899" },
    { name: "Savings",  value: Math.max(netSavings, 0),       color: "#22d3ee" },
  ];

  const grouped = groupByCategory(expenses);
  const catData = Object.entries(grouped)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || "#94a3b8" }));

  const tabs = [
    { key: "allocation" as const, label: "Allocation",    Icon: PieIcon    },
    { key: "trend"      as const, label: "Savings Trend", Icon: TrendingUp },
    { key: "breakdown"  as const, label: "Categories",    Icon: BarChart2  },
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: t.tooltipBg, border: `1px solid ${t.cardBorder}`, borderRadius: "12px", padding: "8px 14px", boxShadow: t.cardShadow }}>
        {label && <p style={{ fontSize: "11px", color: t.textMuted, marginBottom: "6px" }}>{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: "13px", fontWeight: 800, color: p.color || t.text, fontVariantNumeric: "tabular-nums" }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="fade-in-up" style={{
      animationDelay: "0.2s", borderRadius: "24px", overflow: "hidden",
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow,
      backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", transition: "background 0.4s",
    }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, #ec4899, #8b5cf6, #6366f1)", boxShadow: theme === "dark" ? "0 0 20px rgba(139,92,246,0.7)" : "none" }} />

      <div style={{ padding: "22px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.label, marginBottom: "5px" }}>Analytics</div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: t.text }}>Spending Insights</h2>
          </div>
          <div style={{ display: "flex", gap: "4px", padding: "3px", borderRadius: "12px", background: t.inputBg, border: `1px solid ${t.subCardBorder}` }}>
            {tabs.map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setActiveChart(key)} style={{
                display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "9px", border: "none", cursor: "pointer",
                background: activeChart === key ? "rgba(99,102,241,0.25)" : "transparent",
                color: activeChart === key ? "#a5b4fc" : t.textDim,
                fontSize: "11px", fontWeight: 600, transition: "all 0.2s",
              }}>
                <Icon size={11} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: "1px", background: t.divider, marginBottom: "20px" }} />

        {/* Allocation donut */}
        {activeChart === "allocation" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ flexShrink: 0, width: 170, height: 170 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={2} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                      {allocationData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", minWidth: 0 }}>
                {allocationData.map((entry, i) => {
                  const pct = ((entry.value / MONTHLY_SALARY) * 100).toFixed(1);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "3px", flexShrink: 0, background: entry.color }} />
                      <span style={{ fontSize: "12px", color: t.textMuted, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name}</span>
                      <span style={{ fontSize: "11px", color: t.textDim, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: t.text, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(entry.value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginTop: "16px", padding: "12px 16px", borderRadius: "14px", background: t.subCardBg, border: `1px solid ${t.subCardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: t.textDim, fontWeight: 600 }}>Total Monthly</span>
              <span style={{ fontSize: "16px", fontWeight: 900, color: t.text, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(MONTHLY_SALARY)}</span>
            </div>
          </div>
        )}

        {/* Savings trend */}
        {activeChart === "trend" && (
          <div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              {[
                { label: "Avg Savings", val: formatCurrency(monthlyData.reduce((s, d) => s + d.savings, 0) / 6), c: "#22d3ee" },
                { label: "This Month",  val: formatCurrency(Math.max(netSavings, 0)), c: "#34d399" },
                { label: "Target",      val: formatCurrency(MONTHLY_SALARY * 0.5), c: "#a78bfa" },
              ].map((item) => (
                <div key={item.label} style={{
                  flex: 1, padding: "10px 12px", borderRadius: "14px",
                  background: t.subCardBg, border: `1px solid ${t.subCardBorder}`, textAlign: "center",
                }}>
                  <div style={{ fontSize: "10px", color: t.textDim, fontWeight: 600, marginBottom: "4px" }}>{item.label}</div>
                  <div style={{ fontSize: "14px", fontWeight: 900, color: item.c, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{item.val}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: t.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: t.textDim, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="savings" name="Savings" stroke="#22d3ee" strokeWidth={2.5} fill="url(#savingsGrad)" dot={false} activeDot={{ r: 5, fill: "#22d3ee" }} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ec4899" strokeWidth={2} fill="url(#expGrad)" dot={false} activeDot={{ r: 4, fill: "#ec4899" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "12px", justifyContent: "center" }}>
              {[{ c: "#22d3ee", label: "Savings" }, { c: "#ec4899", label: "Expenses" }].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "20px", height: "2.5px", borderRadius: "9999px", background: item.c }} />
                  <span style={{ fontSize: "10px", color: t.textDim }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {activeChart === "breakdown" && (
          <div>
            {catData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Target size={32} style={{ color: t.textFaint, margin: "0 auto 12px" }} />
                <div style={{ fontSize: "13px", color: t.textDim }}>Upload a statement to see</div>
                <div style={{ fontSize: "11px", color: t.textFaint, marginTop: "4px" }}>category breakdown</div>
                <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
                  {["Dining", "Shopping", "Transport", "Groceries", "Entertainment"].map((cat) => (
                    <div key={cat}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontSize: "11px", color: t.textDim }}>{cat}</span>
                        <span style={{ fontSize: "11px", color: t.textFaint }}>--</span>
                      </div>
                      <div style={{ height: "3px", borderRadius: "9999px", background: t.progressTrack }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={catData} barSize={20} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: t.textDim, fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: t.textDim, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Amount" radius={[6, 6, 0, 0]}>
                        {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {catData.slice(0, 4).map((entry) => {
                    const pct = (entry.value / totalCC) * 100;
                    return (
                      <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "11px", color: t.textMuted, flex: 1 }}>{entry.name}</span>
                        <span style={{ fontSize: "10px", color: t.textDim }}>{pct.toFixed(0)}%</span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: t.text, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(entry.value)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
