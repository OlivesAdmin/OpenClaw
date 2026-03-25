"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

const COLORS = {
  dark: {
    pageBg: "#060912",
    headerBg: "rgba(6,9,18,0.92)",
    cardBg: "rgba(14, 20, 42, 0.95)",
    cardBorder: "rgba(255,255,255,0.10)",
    cardShadow: "0 20px 60px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.06) inset",
    text: "#f1f5f9",
    textSecondary: "#e2e8f0",
    textMuted: "#94a3b8",
    textDim: "#64748b",
    textFaint: "#475569",
    label: "#94a3b8",
    divider: "rgba(255,255,255,0.06)",
    inputBg: "rgba(255,255,255,0.04)",
    inputBorder: "rgba(255,255,255,0.08)",
    subCardBg: "rgba(255,255,255,0.03)",
    subCardBorder: "rgba(255,255,255,0.06)",
    chartGrid: "rgba(255,255,255,0.04)",
    tooltipBg: "rgba(10,14,30,0.97)",
    progressTrack: "rgba(255,255,255,0.06)",
    summaryCardBg: "rgba(12,18,38,0.95)",
    hoverBg: "rgba(255,255,255,0.03)",
    selectBg: "#0d1220",
  },
  light: {
    pageBg: "#f0f4f8",
    headerBg: "rgba(255,255,255,0.92)",
    cardBg: "rgba(255,255,255,0.98)",
    cardBorder: "rgba(0,0,0,0.08)",
    cardShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    text: "#0f172a",
    textSecondary: "#1e293b",
    textMuted: "#475569",
    textDim: "#64748b",
    textFaint: "#94a3b8",
    label: "#475569",
    divider: "rgba(0,0,0,0.08)",
    inputBg: "rgba(0,0,0,0.03)",
    inputBorder: "rgba(0,0,0,0.1)",
    subCardBg: "rgba(0,0,0,0.02)",
    subCardBorder: "rgba(0,0,0,0.06)",
    chartGrid: "rgba(0,0,0,0.06)",
    tooltipBg: "rgba(255,255,255,0.97)",
    progressTrack: "rgba(0,0,0,0.06)",
    summaryCardBg: "rgba(255,255,255,0.98)",
    hoverBg: "rgba(0,0,0,0.02)",
    selectBg: "#ffffff",
  },
};

export type ThemeColors = typeof COLORS.dark;

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  t: ThemeColors;
}

const Ctx = createContext<ThemeCtx>({
  theme: "dark",
  toggle: () => {},
  t: COLORS.dark,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("openclaw_theme") as Theme | null;
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("openclaw_theme", next);
  };

  return (
    <Ctx.Provider value={{ theme, toggle, t: COLORS[theme] }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  return useContext(Ctx);
}
