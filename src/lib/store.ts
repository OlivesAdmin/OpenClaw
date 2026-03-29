"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCardExpense, Statement, FixedExpense } from "./types";

const STORAGE_KEY = "openclaw_data";

interface AppData {
  statements: Statement[];
  creditCardExpenses: CreditCardExpense[];
  selectedMonth: string;
}

const defaultData: AppData = {
  statements: [],
  creditCardExpenses: [],
  selectedMonth: "all",
};

export function useAppStore() {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AppData = JSON.parse(stored);
        // Always use "all" if there are statements (force cumulative view)
        if (parsed.statements.length > 0) {
          parsed.selectedMonth = "all";
        }
        setData(parsed);
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const save = useCallback((newData: AppData) => {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch {
      // ignore
    }
  }, []);

  const addStatement = useCallback(
    (statement: Statement) => {
      const allExpenses = [
        ...data.creditCardExpenses.filter(e => !statement.expenses.find(se => se.id === e.id)),
        ...statement.expenses,
      ];
      // Always switch to "all" when adding a statement so cumulative view is shown
      const newData = {
        ...data,
        statements: [...data.statements.filter(s => s.id !== statement.id), statement],
        creditCardExpenses: allExpenses,
        selectedMonth: "all",
      };
      save(newData);
    },
    [data, save]
  );

  const removeStatement = useCallback(
    (statementId: string) => {
      const stmt = data.statements.find((s) => s.id === statementId);
      if (!stmt) return;
      const expenseIds = new Set(stmt.expenses.map((e) => e.id));
      const remainingStmts = data.statements.filter((s) => s.id !== statementId);
      const newData = {
        ...data,
        statements: remainingStmts,
        creditCardExpenses: data.creditCardExpenses.filter((e) => !expenseIds.has(e.id)),
        selectedMonth: remainingStmts.length > 0 ? "all" : "all",
      };
      save(newData);
    },
    [data, save]
  );

  const setSelectedMonth = useCallback(
    (month: string) => {
      save({ ...data, selectedMonth: month });
    },
    [data, save]
  );

  const updateExpenseCategory = useCallback(
    (expenseId: string, category: string) => {
      const newData = {
        ...data,
        creditCardExpenses: data.creditCardExpenses.map((e) =>
          e.id === expenseId ? { ...e, category } : e
        ),
        statements: data.statements.map((s) => ({
          ...s,
          expenses: s.expenses.map((e) =>
            e.id === expenseId ? { ...e, category } : e
          ),
        })),
      };
      save(newData);
    },
    [data, save]
  );

  const clearAll = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setData(defaultData);
  }, []);

  return {
    statements: data.statements,
    creditCardExpenses: data.creditCardExpenses,
    selectedMonth: data.selectedMonth,
    isLoaded,
    addStatement,
    removeStatement,
    setSelectedMonth,
    updateExpenseCategory,
    clearAll,
  };
}

export const FIXED_EXPENSES: FixedExpense[] = [
  {
    id: "rental",
    name: "Rental",
    amount: 6300,
    icon: "🏠",
    color: "#6366f1",
  },
  {
    id: "utility",
    name: "Utility Bills",
    amount: 600,
    icon: "⚡",
    color: "#f59e0b",
  },
  {
    id: "helper",
    name: "Helper",
    amount: 800,
    icon: "👤",
    color: "#10b981",
  },
];

export const MONTHLY_SALARY = 17000;
export const CREDIT_CARD_BUDGET = 10000;
