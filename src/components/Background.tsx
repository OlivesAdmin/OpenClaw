"use client";

export default function Background() {
  return (
    <>
      {/* Deep gradient base */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 15% -5%, rgba(99,102,241,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 85% 105%, rgba(139,92,246,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 55% 50%, rgba(6,182,212,0.04) 0%, transparent 60%),
            linear-gradient(160deg, #060b18 0%, #070c1d 40%, #060e1c 100%)
          `,
        }}
      />

      {/* Floating orbs */}
      <div className="orb" style={{ width: 700, height: 700, top: "-150px", left: "-150px", background: "#6366f1" }} />
      <div className="orb" style={{ width: 600, height: 600, bottom: "-120px", right: "-120px", background: "#7c3aed" }} />
      <div className="orb" style={{ width: 350, height: 350, top: "35%", left: "55%", background: "#06b6d4", opacity: 0.05 }} />

      {/* Fine grid overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Noise texture overlay for depth */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          opacity: 0.4,
          mixBlendMode: "overlay",
        }}
      />
    </>
  );
}
