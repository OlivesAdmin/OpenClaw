"use client";

export default function Background() {
  return (
    <>
      {/* Base */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: "#060912" }} />

      {/* Aurora — top left indigo bloom */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 65% at -10% -20%, rgba(99,102,241,0.45) 0%, transparent 60%)",
      }} />

      {/* Aurora — bottom right violet */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 55% at 110% 110%, rgba(139,92,246,0.38) 0%, transparent 55%)",
      }} />

      {/* Aurora — top centre blue */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 50% 40% at 55% -5%, rgba(59,130,246,0.22) 0%, transparent 55%)",
      }} />

      {/* Gold warm glow — bottom */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 110%, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.08) 40%, transparent 65%)",
      }} />

      {/* Mid-screen cyan accent */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 40% 30% at 80% 50%, rgba(6,182,212,0.12) 0%, transparent 55%)",
      }} />

      {/* Grid overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)
        `,
        backgroundSize: "72px 72px",
      }} />

      {/* Edge vignette to darken corners */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 45%, rgba(4,6,14,0.85) 100%)",
      }} />
    </>
  );
}
