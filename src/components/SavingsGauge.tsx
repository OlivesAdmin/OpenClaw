"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Award, TrendingUp, Zap } from "lucide-react";
import { FIXED_EXPENSES, MONTHLY_SALARY, CREDIT_CARD_BUDGET } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

interface SavingsGaugeProps {
  totalCC: number;
}

const CARD_STYLE = {
  borderRadius: "24px",
  overflow: "hidden" as const,
  background: "rgba(14, 20, 42, 0.95)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.06) inset",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
};

export default function SavingsGauge({ totalCC }: SavingsGaugeProps) {
  const totalFixed  = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const netSavings  = MONTHLY_SALARY - totalFixed - totalCC;
  const savingsRate = Math.max((netSavings / MONTHLY_SALARY) * 100, 0);
  const targetRate  = 50; // 50% savings target
  const isGood      = savingsRate >= 40;

  // For gauge: current savings rate
  const gaugeData = [{ name: "Savings", value: savingsRate, fill: isGood ? "#22d3ee" : "#f59e0b" }];

  // Financial health score (0-100)
  const ccRatio   = totalCC / CREDIT_CARD_BUDGET;
  const health    = Math.round(
    (savingsRate / targetRate) * 50 +   // 50 pts for savings
    Math.max(0, (1 - ccRatio)) * 30 +   // 30 pts for CC discipline
    20                                   // 20 pts baseline
  );
  const clampedHealth = Math.min(health, 100);
  const healthColor = clampedHealth >= 80 ? "#22d3ee" : clampedHealth >= 60 ? "#34d399" : clampedHealth >= 40 ? "#f59e0b" : "#f87171";
  const healthLabel = clampedHealth >= 80 ? "Excellent" : clampedHealth >= 60 ? "Good" : clampedHealth >= 40 ? "Fair" : "Needs Work";

  const milestones = [
    { label: "Save ≥40%",   done: savingsRate >= 40,  c: "#34d399" },
    { label: "CC in budget", done: totalCC <= CREDIT_CARD_BUDGET, c: "#6366f1" },
    { label: "Fixed < 50%", done: totalFixed / MONTHLY_SALARY < 0.5, c: "#f59e0b" },
    { label: "No deficit",  done: netSavings >= 0, c: "#22d3ee" },
  ];

  return (
    <div className="fade-in-up" style={{ ...CARD_STYLE, animationDelay: "0.18s" }}>
      <div style={{ height: "4px", background: `linear-gradient(90deg, ${healthColor}, ${isGood ? "#6366f1" : "#f97316"})`, boxShadow: `0 0 20px ${healthColor}aa` }} />

      <div style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", marginBottom: "5px" }}>Financial Health</div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>Savings Rate</h2>
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

        {/* Radial gauge */}
        <div style={{ position: "relative", height: 180, marginBottom: "6px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="85%"
              innerRadius="60%" outerRadius="90%"
              startAngle={180} endAngle={0}
              data={gaugeData}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              {/* Background track */}
              <RadialBar
                background={{ fill: "rgba(255,255,255,0.05)" }}
                dataKey="value"
                angleAxisId={0}
                cornerRadius={8}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div style={{
            position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)",
            textAlign: "center",
          }}>
            <div style={{
              fontSize: "36px", fontWeight: 900, letterSpacing: "-0.06em",
              color: isGood ? "#22d3ee" : "#f59e0b",
              textShadow: `0 0 30px ${isGood ? "rgba(34,211,238,0.5)" : "rgba(245,158,11,0.5)"}`,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}>
              {savingsRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>of income saved</div>
          </div>

          {/* Target marker labels */}
          <div style={{ position: "absolute", bottom: "0", left: "10%", fontSize: "9px", color: "#334155" }}>0%</div>
          <div style={{ position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)", fontSize: "9px", color: "#475569" }}>50%</div>
          <div style={{ position: "absolute", bottom: "0", right: "10%", fontSize: "9px", color: "#334155" }}>100%</div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
          {[
            { label: "Saved/mo",  val: formatCurrency(Math.max(netSavings, 0)), c: "#22d3ee" },
            { label: "Annual proj.", val: formatCurrency(Math.max(netSavings, 0) * 12), c: "#a78bfa" },
          ].map((item) => (
            <div key={item.label} style={{
              padding: "10px 12px", borderRadius: "14px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: "10px", color: "#475569", marginBottom: "4px" }}>{item.label}</div>
              <div style={{ fontSize: "15px", fontWeight: 900, color: item.c, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{item.val}</div>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#334155", marginBottom: "10px" }}>Goals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {milestones.map((m) => (
              <div key={m.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "18px", height: "18px", borderRadius: "6px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: m.done ? `${m.c}18` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${m.done ? m.c + "40" : "rgba(255,255,255,0.06)"}`,
                }}>
                  {m.done
                    ? <Zap size={10} style={{ color: m.c }} />
                    : <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                  }
                </div>
                <span style={{ fontSize: "12px", color: m.done ? "#94a3b8" : "#475569", textDecoration: m.done ? "none" : "none" }}>{m.label}</span>
                {m.done && <span style={{ marginLeft: "auto", fontSize: "10px", color: m.c, fontWeight: 700 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Health score bar */}
        <div style={{ padding: "12px 14px", borderRadius: "14px", background: `${healthColor}0a`, border: `1px solid ${healthColor}1a` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp size={11} style={{ color: healthColor }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Health Score</span>
            </div>
            <span style={{ fontSize: "16px", fontWeight: 900, color: healthColor, letterSpacing: "-0.04em" }}>{clampedHealth}/100</span>
          </div>
          <div style={{ height: "6px", borderRadius: "9999px", background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
            <div className="progress-bar-fill" style={{
              height: "100%", borderRadius: "9999px",
              width: `${clampedHealth}%`,
              background: `linear-gradient(90deg, ${healthColor}, #6366f1)`,
              boxShadow: `0 0 10px ${healthColor}70`,
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
