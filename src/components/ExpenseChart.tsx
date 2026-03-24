"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { BarChart2, PieChartIcon, TrendingUp } from "lucide-react";
import { CreditCardExpense, CATEGORY_COLORS } from "@/lib/types";
import { groupByCategory, formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface ExpenseChartProps {
  expenses: CreditCardExpense[];
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-3 py-2 text-xs"
        style={{
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        <p className="text-slate-300 font-medium mb-0.5">{payload[0].name}</p>
        <p className="text-white font-bold tabular-nums">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function ExpenseChart({ expenses }: ExpenseChartProps) {
  const [view, setView] = useState<"pie" | "bar">("pie");
  const grouped = groupByCategory(expenses);
  const data = Object.entries(grouped)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));
  const grandTotal = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 fade-in-up flex flex-col items-center justify-center min-h-[280px] gap-3"
        style={{ animationDelay: "0.2s" }}>
        <div className="icon-box w-12 h-12" style={{ background: "rgba(99,102,241,0.1)" }}>
          <TrendingUp size={22} className="text-slate-500" />
        </div>
        <div className="text-center">
          <div className="text-sm text-slate-400 font-medium">No expense data</div>
          <div className="text-[11px] text-slate-600 mt-0.5">Upload a statement to see charts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden fade-in-up" style={{ animationDelay: "0.2s" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Spending Breakdown</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">{data.length} categories</p>
          </div>
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
            {([
              { key: "pie", Icon: PieChartIcon },
              { key: "bar", Icon: BarChart2 },
            ] as const).map(({ key, Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className="px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all"
                style={{
                  background: view === key ? "rgba(99,102,241,0.25)" : "transparent",
                  color: view === key ? "#a5b4fc" : "#64748b",
                }}
              >
                <Icon size={13} />
                <span className="text-xs font-medium capitalize">{key}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {view === "pie" ? (
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0" style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%" cy="50%"
                    innerRadius={42} outerRadius={62}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              {data.map((entry) => {
                const pct = ((entry.value / grandTotal) * 100).toFixed(1);
                const color = CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || "#94a3b8";
                return (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs text-slate-400 flex-1 truncate">{entry.name}</span>
                    <span className="text-[11px] text-slate-500 tabular-nums">{pct}%</span>
                    <span className="text-xs font-semibold text-white tabular-nums">{formatCurrency(entry.value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barSize={16} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#475569", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Total */}
        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
          <span className="section-label">Total CC Spend</span>
          <span className="text-sm font-bold gradient-text tabular-nums">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
