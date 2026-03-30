"use client";

import { useState } from "react";
import {
  Utensils, ShoppingBag, Plane, Film, Heart, ShoppingCart,
  Car, Zap, Package, CreditCard, Search, Trash2, X
} from "lucide-react";
import { CreditCardExpense, Statement, EXPENSE_CATEGORIES, CATEGORY_COLORS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

interface CreditCardExpensesProps {
  statements: Statement[];
  expenses: CreditCardExpense[];
  selectedMonth: string;
  onRemoveStatement: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  onMonthChange: (month: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Dining: Utensils, Shopping: ShoppingBag, Travel: Plane, Entertainment: Film,
  Healthcare: Heart, Groceries: ShoppingCart, Transport: Car, Utilities: Zap, Others: Package,
};

export default function CreditCardExpenses({
  statements, expenses, selectedMonth, onRemoveStatement, onUpdateCategory, onMonthChange,
}: CreditCardExpensesProps) {
  const { theme, t } = useTheme();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"transactions" | "statements">("transactions");

  const filtered = expenses.filter((e) => {
    const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || e.category === filterCategory;
    return matchSearch && matchCat;
  });
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  // Per-statement totals computed from the SAME filtered expenses prop the Transactions tab uses
  // This ensures Grand Total always matches the Transactions tab total
  const stmtMonthTotals = statements.map(s => {
    const stmtIds = new Set(s.expenses.map(e => e.id));
    const matching = expenses.filter(e => stmtIds.has(e.id));
    return {
      ...s,
      monthTotal: matching.reduce((sum, e) => sum + e.amount, 0),
      monthCount: matching.length,
    };
  });
  // Grand Total = exact same sum as Transactions tab
  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="fade-in-up" style={{
      animationDelay: "0.25s", borderRadius: "24px", overflow: "hidden",
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow,
      backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", transition: "background 0.4s",
    }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, #ec4899, #f97316)", boxShadow: theme === "dark" ? "0 0 20px #ec4899cc" : "none" }} />

      <div style={{ padding: "22px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: t.text }}>Credit Card Expenses</h2>
            <p style={{ fontSize: "11px", color: t.textDim, marginTop: "2px" }}>
              {filtered.length} transactions · <span style={{ color: t.textMuted, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(total)}</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              onClick={() => onMonthChange("all")}
              style={{
                padding: "6px 14px", fontSize: "12px", fontWeight: 700, borderRadius: "10px",
                border: `1px solid ${selectedMonth === "all" ? "rgba(99,102,241,0.6)" : t.inputBorder}`,
                background: selectedMonth === "all" ? "rgba(99,102,241,0.22)" : t.inputBg,
                color: selectedMonth === "all" ? "#a5b4fc" : t.textDim,
                cursor: "pointer", whiteSpace: "nowrap",
                boxShadow: selectedMonth === "all" ? "0 0 12px rgba(99,102,241,0.25)" : "none",
              }}
            >All months</button>
            <input type="month" value={selectedMonth === "all" ? "" : selectedMonth}
              onChange={(e) => onMonthChange(e.target.value || "all")}
              placeholder="Filter month"
              style={{
                padding: "6px 10px", fontSize: "12px", borderRadius: "10px",
                background: selectedMonth !== "all" ? "rgba(99,102,241,0.12)" : t.inputBg,
                border: `1px solid ${selectedMonth !== "all" ? "rgba(99,102,241,0.4)" : t.inputBorder}`,
                color: t.textSecondary, outline: "none", colorScheme: theme,
              }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", padding: "3px", borderRadius: "12px", background: t.inputBg, marginBottom: "16px" }}>
          {(["transactions", "statements"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: "6px", borderRadius: "9px", border: "none", cursor: "pointer",
              fontSize: "12px", fontWeight: 600, textTransform: "capitalize", transition: "all 0.2s",
              background: activeTab === tab ? "rgba(99,102,241,0.25)" : "transparent",
              color: activeTab === tab ? "#a5b4fc" : t.textDim,
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
            }}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "statements" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {statements.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: "8px" }}>
                <CreditCard size={24} style={{ color: t.textFaint }} />
                <div style={{ fontSize: "13px", color: t.textDim }}>No statements uploaded yet</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "10px", color: t.textDim, marginBottom: "2px" }}>
                  {selectedMonth === "all" ? "All uploaded transactions" : `Transactions in selected month only`}
                </div>
                {stmtMonthTotals.map((s) => (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px", borderRadius: "14px",
                    background: t.subCardBg, border: `1px solid ${t.subCardBorder}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(99,102,241,0.12)" }}>
                        <CreditCard size={14} style={{ color: "#818cf8" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: t.text }}>{s.cardName}</div>
                        <div style={{ fontSize: "10px", color: t.textDim }}>
                          {s.filename} · {s.monthCount} txns
                          {s.monthCount !== s.expenses.length && (
                            <span style={{ color: t.textFaint }}> ({s.expenses.length} total in file)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: t.text, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(s.monthTotal)}</div>
                        {s.monthTotal !== s.total && (
                          <div style={{ fontSize: "10px", color: t.textFaint }}>{formatCurrency(s.total)} in file</div>
                        )}
                      </div>
                      <button onClick={() => onRemoveStatement(s.id)} style={{
                        width: "26px", height: "26px", borderRadius: "8px", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: t.subCardBg, color: t.textDim,
                      }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                {statements.length > 1 && (
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", borderRadius: "12px",
                    background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)",
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: t.textMuted }}>
                      Grand Total {selectedMonth !== "all" && `(${selectedMonth})`}
                    </span>
                    <span style={{ fontSize: "15px", fontWeight: 900, color: "#ec4899", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(grandTotal)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={12} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textDim }} />
                <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%", padding: "6px 32px 6px 32px", fontSize: "12px", borderRadius: "10px",
                    background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textSecondary, outline: "none",
                  }} />
                {search && (
                  <button onClick={() => setSearch("")} style={{
                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: t.textDim,
                  }}>
                    <X size={11} />
                  </button>
                )}
              </div>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  padding: "6px 10px", fontSize: "12px", borderRadius: "10px",
                  background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textSecondary, outline: "none",
                }}>
                <option value="All" style={{ background: t.selectBg }}>All</option>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c} style={{ background: t.selectBg }}>{c}</option>)}
              </select>
            </div>

            <div style={{ maxHeight: "288px", overflowY: "auto", paddingRight: "4px" }}>
              {filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: "8px" }}>
                  <Search size={24} style={{ color: t.textFaint }} />
                  <div style={{ fontSize: "13px", color: t.textDim }}>
                    {expenses.length === 0 ? "Upload a statement to get started" : "No matching transactions"}
                  </div>
                </div>
              ) : (
                filtered.map((expense) => {
                  const catColor = CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS] || "#94a3b8";
                  const Icon = CATEGORY_ICONS[expense.category] || Package;
                  return (
                    <div key={expense.id} style={{
                      display: "flex", alignItems: "center", gap: "12px", padding: "8px 10px",
                      borderRadius: "10px", transition: "background 0.15s", cursor: "default",
                    }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${catColor}18` }}>
                        <Icon size={13} style={{ color: catColor }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12px", color: t.textSecondary, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{expense.description}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                          <span style={{ fontSize: "10px", color: t.textDim }}>{expense.date}</span>
                          <select value={expense.category} onChange={(e) => onUpdateCategory(expense.id, e.target.value)}
                            style={{ fontSize: "10px", color: catColor, background: "transparent", border: "none", outline: "none", cursor: "pointer" }}>
                            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c} style={{ background: t.selectBg, color: t.textSecondary }}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: t.text, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {filtered.length > 0 && (
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${t.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: t.textDim }}>{filtered.length} transactions</span>
                <span style={{ fontSize: "14px", fontWeight: 900, color: "#ec4899", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(total)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
