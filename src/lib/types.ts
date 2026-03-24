export interface CreditCardExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  cardName: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  icon: string;
  color: string;
}

export interface Statement {
  id: string;
  filename: string;
  uploadDate: string;
  cardName: string;
  month: string;
  expenses: CreditCardExpense[];
  total: number;
}

export interface BudgetCategory {
  name: string;
  budget: number;
  spent: number;
  color: string;
}

export type ExpenseCategory =
  | "Dining"
  | "Shopping"
  | "Travel"
  | "Entertainment"
  | "Healthcare"
  | "Groceries"
  | "Transport"
  | "Utilities"
  | "Others";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Dining",
  "Shopping",
  "Travel",
  "Entertainment",
  "Healthcare",
  "Groceries",
  "Transport",
  "Utilities",
  "Others",
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Dining: "#f97316",
  Shopping: "#8b5cf6",
  Travel: "#06b6d4",
  Entertainment: "#ec4899",
  Healthcare: "#10b981",
  Groceries: "#84cc16",
  Transport: "#f59e0b",
  Utilities: "#6366f1",
  Others: "#94a3b8",
};

export const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  Dining: ["restaurant", "cafe", "food", "dining", "mcdonald", "kfc", "grab food", "foodpanda", "hawker"],
  Shopping: ["shopping", "mall", "store", "lazada", "shopee", "amazon", "zara", "h&m", "uniqlo"],
  Travel: ["airline", "hotel", "booking", "airbnb", "travel", "flight", "grab", "taxi", "uber", "mrt", "bus"],
  Entertainment: ["netflix", "spotify", "cinema", "movie", "entertainment", "game", "steam"],
  Healthcare: ["clinic", "hospital", "pharmacy", "medical", "dental", "doctor", "health"],
  Groceries: ["fairprice", "cold storage", "giant", "ntuc", "supermarket", "grocery"],
  Transport: ["parking", "petrol", "esso", "shell", "caltex", "ez-link", "transport"],
  Utilities: ["singtel", "starhub", "m1", "sp services", "utility", "internet", "phone"],
  Others: [],
};
