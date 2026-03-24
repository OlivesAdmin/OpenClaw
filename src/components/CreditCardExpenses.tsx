"use client";

import { useState } from "react";
import {
  Utensils, ShoppingBag, Plane, Film, Heart, ShoppingCart,
  Car, Zap, Package, CreditCard, Search, Trash2, X
} from "lucide-react";
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

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Dining: Utensils,
  Shopping: ShoppingBag,
  Travel: Plane,
  Entertainment: Film,
  Healthcare: Heart,
  Groceries: ShoppingCart,
  Transport: Car,
  Utilities: Zap,
  Others: Package,
};

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
    const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || e.category === filterCategory;
    return matchSearch && matchCat;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const byCard = statements.reduce((acc, s) => {
    acc[s.cardName] = (acc[s.cardName] || 0) + s.total;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="glass rounded-2xl overflow-hidden fade-in-up" style={{ animationDelay: "0.25s" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Credit Card Expenses</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {filtered.length} transactions · <span className="text-slate-400 tabular-nums">{formatCurrency(total)}</span>
            </p>
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="input-glass px-2.5 py-1.5 text-xs text-slate-300"
            style={{ colorScheme: "dark" }}
          />
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Tabs */}
        <div className="flex gap-1 p-0.5 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
          {(["transactions", "statements"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
              style={{
                background: activeTab === tab ? "rgba(99,102,241,0.25)" : "transparent",
                color: activeTab === tab ? "#a5b4fc" : "#64748b",
                boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "statements" ? (
          <div className="space-y-2">
            {statements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="icon-box w-10 h-10" style={{ background: "rgba(99,102,241,0.1)" }}>
                  <CreditCard size={18} className="text-slate-500" />
                </div>
                <div className="text-sm text-slate-600">No statements uploaded yet</div>
              </div>
            ) : (
              statements.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="icon-box w-8 h-8" style={{ background: "rgba(99,102,241,0.12)" }}>
                      <CreditCard size={14} className="text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{s.cardName}</div>
                      <div className="text-[10px] text-slate-500">{s.filename} · {s.expenses.length} txns · {s.month}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white tabular-nums">{formatCurrency(s.total)}</span>
                    <button
                      onClick={() => onRemoveStatement(s.id)}
                      className="icon-box w-6 h-6 text-slate-600 hover:text-red-400 transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}

            {Object.keys(byCard).length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="section-label mb-2">Total by Card</div>
                {Object.entries(byCard).map(([card, amt]) => (
                  <div key={card} className="flex justify-between py-1.5 text-xs">
                    <span className="text-slate-400">{card}</span>
                    <span className="text-white font-semibold tabular-nums">{formatCurrency(amt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search transactions…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-glass w-full pl-8 pr-8 py-1.5 text-xs text-slate-300"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-glass px-2.5 py-1.5 text-xs text-slate-300"
              >
                <option value="All" style={{ background: "#0f172a" }}>All</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ background: "#0f172a" }}>{c}</option>
                ))}
              </select>
            </div>

            {/* Transactions */}
            <div className="space-y-0.5 max-h-72 overflow-y-auto pr-0.5">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="icon-box w-10 h-10" style={{ background: "rgba(99,102,241,0.1)" }}>
                    <Search size={18} className="text-slate-500" />
                  </div>
                  <div className="text-sm text-slate-600">
                    {expenses.length === 0 ? "Upload a statement to get started" : "No matching transactions"}
                  </div>
                </div>
              ) : (
                filtered.map((expense) => {
                  const catColor = CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS] || "#94a3b8";
                  const Icon = CATEGORY_ICONS[expense.category] || Package;
                  return (
                    <div
                      key={expense.id}
                      className="table-row flex items-center gap-3 px-2.5 py-2"
                    >
                      <div
                        className="icon-box w-7 h-7 flex-shrink-0"
                        style={{ background: `${catColor}18` }}
                      >
                        <Icon size={13} style={{ color: catColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-300 font-medium truncate">{expense.description}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-600">{expense.date}</span>
                          <span className="text-slate-700 text-[10px]">·</span>
                          <select
                            value={expense.category}
                            onChange={(e) => onUpdateCategory(expense.id, e.target.value)}
                            className="text-[10px] outline-none cursor-pointer bg-transparent"
                            style={{ color: catColor }}
                          >
                            {EXPENSE_CATEGORIES.map((c) => (
                              <option key={c} value={c} style={{ background: "#0f172a", color: "#e2e8f0" }}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-white tabular-nums flex-shrink-0">
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {filtered.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-slate-500">{filtered.length} transactions</span>
                <span className="text-sm font-bold gradient-text tabular-nums">{formatCurrency(total)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
