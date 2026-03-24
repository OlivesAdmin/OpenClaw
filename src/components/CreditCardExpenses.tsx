"use client";

import { useState } from "react";
import { CreditCardExpense, Statement, EXPENSE_CATEGORIES, CATEGORY_COLORS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface CreditCardExpensesProps {
  statements: Statement[];
  expenses: CreditCardExpense[];
  selectedMonth: string;
  onRemoveStatement: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  onMonthChange: (month: string) => void;
}

export default function CreditCardExpenses({
  statements,
  expenses,
  selectedMonth,
  onRemoveStatement,
  onUpdateCategory,
  onMonthChange,
}: CreditCardExpensesProps) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"transactions" | "statements">("transactions");

  const filtered = expenses.filter((e) => {
    const matchMonth = !selectedMonth || e.date.startsWith(selectedMonth) ||
      statements.find(s => s.id.includes(selectedMonth) && s.expenses.find(se => se.id === e.id));
    const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || e.category === filterCategory;
    return matchSearch && matchCat;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  // Group by card
  const byCard = statements.reduce((acc, s) => {
    acc[s.cardName] = (acc[s.cardName] || 0) + s.total;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="glass rounded-2xl p-6 fade-in-up" style={{ animationDelay: "0.25s" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Credit Card Expenses</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filtered.length} transactions · {formatCurrency(total)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="rounded-lg px-2 py-1 text-xs text-slate-300 outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              colorScheme: "dark",
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
        {(["transactions", "statements"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
            style={{
              background: activeTab === tab ? "rgba(99,102,241,0.3)" : "transparent",
              color: activeTab === tab ? "#a5b4fc" : "#64748b",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "statements" ? (
        <div className="space-y-2">
          {statements.length === 0 ? (
            <div className="text-center py-8 text-slate-600 text-sm">
              No statements uploaded yet
            </div>
          ) : (
            statements.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                    style={{ background: "rgba(99,102,241,0.15)" }}>
                    💳
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">{s.cardName}</div>
                    <div className="text-xs text-slate-500">{s.filename} · {s.expenses.length} txns</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{formatCurrency(s.total)}</div>
                    <div className="text-xs text-slate-500">{s.month}</div>
                  </div>
                  <button
                    onClick={() => onRemoveStatement(s.id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors text-xs"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Card totals */}
          {Object.keys(byCard).length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Total by Card</div>
              {Object.entries(byCard).map(([card, amt]) => (
                <div key={card} className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">{card}</span>
                  <span className="text-white font-medium">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none placeholder-slate-600"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <option value="All" style={{ background: "#0f172a" }}>All</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c} style={{ background: "#0f172a" }}>{c}</option>
              ))}
            </select>
          </div>

          {/* Transactions list */}
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-sm">
                {expenses.length === 0 ? "Upload a statement to see transactions" : "No matching transactions"}
              </div>
            ) : (
              filtered.map((expense) => (
                <div
                  key={expense.id}
                  className="table-row flex items-center gap-3 px-2 py-1.5 rounded-lg"
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                    style={{
                      background: `${CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS] || "#94a3b8"}25`,
                    }}
                  >
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-300 truncate">{expense.description}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-slate-600">{expense.date}</span>
                      <span className="text-slate-700">·</span>
                      <select
                        value={expense.category}
                        onChange={(e) => onUpdateCategory(expense.id, e.target.value)}
                        className="text-xs outline-none cursor-pointer"
                        style={{
                          background: "transparent",
                          color: CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS] || "#94a3b8",
                        }}
                      >
                        {EXPENSE_CATEGORIES.map((c) => (
                          <option key={c} value={c} style={{ background: "#0f172a", color: "#e2e8f0" }}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white flex-shrink-0">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              ))
            )}
          </div>

          {filtered.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs text-slate-500">{filtered.length} transactions</span>
              <span className="text-sm font-bold gradient-text">{formatCurrency(total)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Dining: "🍜",
    Shopping: "🛍",
    Travel: "✈️",
    Entertainment: "🎬",
    Healthcare: "💊",
    Groceries: "🛒",
    Transport: "🚗",
    Utilities: "📡",
    Others: "📦",
  };
  return icons[category] || "📦";
}
