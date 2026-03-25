"use client";

export default function Background() {
  return (
    <>
      {/* Deep space base */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: "#050810" }} />

      {/* Aurora mesh — primary layer */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 110% 70% at -15% -20%, rgba(99,102,241,0.28) 0%, transparent 55%),
            radial-gradient(ellipse 80%  60% at 115% 115%, rgba(139,92,246,0.22) 0%, transparent 50%),
            radial-gradient(ellipse 55%  45% at 55%   -5%, rgba(59,130,246,0.14) 0%, transparent 50%),
            radial-gradient(ellipse 40%  35% at 85%   25%, rgba(16,185,129,0.08) 0%, transparent 45%)
          `,
        }}
      />

      {/* Warm gold ambient — bottom centre (from design reference) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 65% 50% at 50% 105%, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.06) 40%, transparent 65%)
          `,
        }}
      />

      {/* Floating orbs */}
      <div className="orb" style={{ width: 1000, height: 1000, top: "-350px", left: "-350px", background: "#6366f1", opacity: 0.13 }} />
      <div className="orb" style={{ width: 750,  height: 750,  bottom: "-250px", right: "-250px", background: "#8b5cf6", opacity: 0.11 }} />
      <div className="orb" style={{ width: 500,  height: 500,  top: "35%", left: "55%", background: "#06b6d4", opacity: 0.06 }} />
      <div className="orb" style={{ width: 450,  height: 450,  bottom: "-80px",  left: "25%", background: "#fbbf24", opacity: 0.08 }} />
      <div className="orb" style={{ width: 350,  height: 350,  top: "20%", right: "10%", background: "#10b981", opacity: 0.05 }} />

      {/* Subtle grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />

      {/* Edge vignette */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(5,8,16,0.7) 100%)
          `,
        }}
      />
    </>
  );
}
