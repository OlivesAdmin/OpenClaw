"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Award, TrendingUp, Zap } from "lucide-react";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

interface SavingsGaugeProps {
  totalCC: number;
  monthMultiplier?: number;
}

export default function SavingsGauge({ totalCC, monthMultiplier = 1 }: SavingsGaugeProps) {
  const { theme, t } = useTheme();
  const totalFixed  = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0) * monthMultiplier;
  const salary      = MONTHLY_SALARY * monthMultiplier;
  const ccBudget    = CREDIT_CARD_BUDGET * monthMultiplier;
  const netSavings  = salary - totalFixed - totalCC;
  const savingsRate = Math.max((netSavings / salary) * 100, 0);
  const targetRate  = 50;
  const isGood      = savingsRate >= 40;

  const gaugeData = [{ name: "Savings", value: savingsRate, fill: isGood ? "#22d3ee" : "#f59e0b" }];

  const ccRatio   = totalCC / ccBudget;
  const health    = Math.round((savingsRate / targetRate) * 50 + Math.max(0, (1 - ccRatio)) * 30 + 20);
  const clampedHealth = Math.min(health, 100);
  const healthColor = clampedHealth >= 80 ? "#22d3ee" : clampedHealth >= 60 ? "#34d399" : clampedHealth >= 40 ? "#f59e0b" : "#f87171";
  const healthLabel = clampedHealth >= 80 ? "Excellent" : clampedHealth >= 60 ? "Good" : clampedHealth >= 40 ? "Fair" : "Needs Work";

  const milestones = [
    { label: "Save ≥40%",   done: savingsRate >= 40,  c: "#34d399" },
    { label: "CC in budget", done: totalCC <= ccBudget, c: "#6366f1" },
    { label: "Fixed < 50%", done: totalFixed / salary < 0.5, c: "#f59e0b" },
    { label: "No deficit",  done: netSavings >= 0, c: "#22d3ee" },
  ];

  return (
    <div className="fade-in-up" style={{
      animationDelay: "0.18s", borderRadius: "24px", overflow: "hidden",
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow,
      backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", transition: "background 0.4s",
    }}>
      <div style={{ height: "4px", background: `linear-gradient(90deg, ${healthColor}, ${isGood ? "#6366f1" : "#f97316"})`, boxShadow: theme === "dark" ? `0 0 20px ${healthColor}aa` : "none" }} />

      <div style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.label, marginBottom: "5px" }}>Financial Health</div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: t.text }}>Savings Rate</h2>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "5px 12px", borderRadius: "9999px",
            background: `${healthColor}14`, border: `1px solid ${healthColor}28`,
          }}>
            <Award size={11} style={{ color: healthColor }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: healthColor }}>{healthLabel}</span>
          </div>
        </div>

        {/* Gauge */}
        <div style={{ position: "relative", height: 180, marginBottom: "6px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="85%" innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} data={gaugeData}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background={{ fill: t.progressTrack }} dataKey="value" angleAxisId={0} cornerRadius={8} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
            <div style={{
              display: "inline-block",
              padding: "4px 14px 6px",
              borderRadius: "12px",
              background: theme === "dark" ? "rgba(6,9,18,0.75)" : "rgba(255,255,255,0.75)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}>
              <div style={{
                fontSize: "28px", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1,
                color: isGood ? "#22d3ee" : "#f59e0b",
                fontVariantNumeric: "tabular-nums",
              }}>
                {savingsRate.toFixed(1)}%
              </div>
            </div>
            <div style={{ fontSize: "11px", color: t.textDim, marginTop: "5px" }}>of income saved</div>
          </div>
          <div style={{ position: "absolute", bottom: "0", left: "10%", fontSize: "9px", color: t.textFaint }}>0%</div>
          <div style={{ position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)", fontSize: "9px", color: t.textDim }}>50%</div>
          <div style={{ position: "absolute", bottom: "0", right: "10%", fontSize: "9px", color: t.textFaint }}>100%</div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
          {[
            { label: monthMultiplier > 1 ? `Saved (${monthMultiplier}mo)` : "Saved/mo", val: formatCurrency(Math.max(netSavings, 0)), c: "#22d3ee" },
            { label: "Annual proj.", val: formatCurrency((Math.max(netSavings, 0) / monthMultiplier) * 12), c: "#a78bfa" },
          ].map((item) => (
            <div key={item.label} style={{ padding: "10px 12px", borderRadius: "14px", background: t.subCardBg, border: `1px solid ${t.subCardBorder}` }}>
              <div style={{ fontSize: "10px", color: t.textDim, marginBottom: "4px" }}>{item.label}</div>
              <div style={{ fontSize: "15px", fontWeight: 900, color: item.c, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{item.val}</div>
            </div>
          ))}
        </div>

        {/* Goals */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.label, marginBottom: "10px" }}>Goals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {milestones.map((m) => (
              <div key={m.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "18px", height: "18px", borderRadius: "6px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: m.done ? `${m.c}18` : t.inputBg,
                  border: `1px solid ${m.done ? m.c + "40" : t.subCardBorder}`,
                }}>
                  {m.done ? <Zap size={10} style={{ color: m.c }} /> : <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.progressTrack }} />}
                </div>
                <span style={{ fontSize: "12px", color: m.done ? t.textMuted : t.textDim }}>{m.label}</span>
                {m.done && <span style={{ marginLeft: "auto", fontSize: "10px", color: m.c, fontWeight: 700 }}>Done</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Health bar */}
        <div style={{ padding: "12px 14px", borderRadius: "14px", background: `${healthColor}0a`, border: `1px solid ${healthColor}1a` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp size={11} style={{ color: healthColor }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: t.textMuted }}>Health Score</span>
            </div>
            <span style={{ fontSize: "16px", fontWeight: 900, color: healthColor, letterSpacing: "-0.04em" }}>{clampedHealth}/100</span>
          </div>
          <div style={{ height: "6px", borderRadius: "9999px", background: t.progressTrack, overflow: "hidden" }}>
            <div className="progress-bar-fill" style={{
              height: "100%", borderRadius: "9999px", width: `${clampedHealth}%`,
              background: `linear-gradient(90deg, ${healthColor}, #6366f1)`,
              boxShadow: theme === "dark" ? `0 0 10px ${healthColor}70` : "none",
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
