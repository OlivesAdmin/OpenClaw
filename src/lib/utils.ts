import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ExpenseCategory,
  CATEGORY_KEYWORDS,
  CreditCardExpense,
} from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function categorizeExpense(description: string): ExpenseCategory {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "Others") continue;
    if (keywords.some((kw) => lower.includes(kw))) {
      return category as ExpenseCategory;
    }
  }
  return "Others";
}

export function parseCSVToExpenses(
  csvData: Record<string, string>[],
  cardName: string
): CreditCardExpense[] {
  return csvData
    .filter((row) => {
      const keys = Object.keys(row).map((k) => k.toLowerCase());
      return keys.some((k) => k.includes("amount") || k.includes("debit"));
    })
    .map((row, index) => {
      const keys = Object.keys(row);
      const dateKey =
        keys.find((k) => k.toLowerCase().includes("date")) || keys[0];
      const descKey =
        keys.find(
          (k) =>
            k.toLowerCase().includes("desc") ||
            k.toLowerCase().includes("merchant") ||
            k.toLowerCase().includes("narration")
        ) || keys[1];
      const amountKey =
        keys.find(
          (k) =>
            k.toLowerCase().includes("amount") ||
            k.toLowerCase().includes("debit")
        ) || keys[2];

      const amountStr = row[amountKey] || "0";
      const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, "")) || 0;

      if (amount <= 0) return null;

      const description = row[descKey] || "Unknown";
      return {
        id: `${cardName}-${index}-${Date.now()}`,
        date: row[dateKey] || new Date().toISOString().split("T")[0],
        description,
        amount,
        category: categorizeExpense(description),
        cardName,
      } as CreditCardExpense;
    })
    .filter(Boolean) as CreditCardExpense[];
}

export function getMonthName(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("en-SG", { month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function groupByCategory(
  expenses: CreditCardExpense[]
): Record<string, number> {
  return expenses.reduce(
    (acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    },
    {} as Record<string, number>
  );
}
