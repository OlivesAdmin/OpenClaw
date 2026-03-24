"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { CreditCardExpense, CATEGORY_COLORS } from "@/lib/types";
import { groupByCategory } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface ExpenseChartProps {
  expenses: CreditCardExpense[];
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs">
        <p className="text-slate-300 font-medium">{payload[0].name}</p>
        <p className="text-white font-bold mt-0.5">{formatCurrency(payload[0].value)}</p>
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

  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 fade-in-up flex flex-col items-center justify-center min-h-[280px]" style={{ animationDelay: "0.2s" }}>
        <div className="text-4xl mb-3">📈</div>
        <div className="text-slate-400 text-sm font-medium">No expense data yet</div>
        <div className="text-slate-600 text-xs mt-1">Upload a statement to see charts</div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 fade-in-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Spending Breakdown</h2>
          <p className="text-xs text-slate-500 mt-0.5">{data.length} categories</p>
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
          {(["pie", "bar"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all"
              style={{
                background: view === v ? "rgba(99,102,241,0.3)" : "transparent",
                color: view === v ? "#a5b4fc" : "#64748b",
              }}
            >
              {v === "pie" ? "Pie" : "Bar"}
            </button>
          ))}
        </div>
      </div>

      {view === "pie" ? (
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0" style={{ width: 140, height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%" cy="50%"
                  innerRadius={42} outerRadius={62}
                  paddingAngle={3}
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
          <div className="flex-1 space-y-1.5">
            {data.map((entry) => {
              const total = data.reduce((s, d) => s + d.value, 0);
              const pct = ((entry.value / total) * 100).toFixed(1);
              return (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || "#94a3b8" }}
                  />
                  <span className="text-xs text-slate-400 flex-1 truncate">{entry.name}</span>
                  <span className="text-xs text-slate-500">{pct}%</span>
                  <span className="text-xs font-medium text-white">{formatCurrency(entry.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={18}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 10 }}
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
    </div>
  );
}
