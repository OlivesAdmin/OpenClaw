"use client";

export default function Background() {
  return (
    <>
      {/* Mesh gradient background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% -10%, rgba(99,102,241,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(139,92,246,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 50% 50%, rgba(6,11,24,1) 0%, transparent 100%),
            linear-gradient(135deg, #060b18 0%, #080d1f 50%, #06111e 100%)
          `,
        }}
      />
      {/* Floating orbs */}
      <div
        className="orb"
        style={{ width: 600, height: 600, top: "-100px", left: "-100px", background: "#6366f1" }}
      />
      <div
        className="orb"
        style={{ width: 500, height: 500, bottom: "-80px", right: "-80px", background: "#8b5cf6" }}
      />
      <div
        className="orb"
        style={{ width: 300, height: 300, top: "40%", left: "60%", background: "#06b6d4" }}
      />
      {/* Grid overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </>
  );
}
