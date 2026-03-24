"use client";

export default function Background() {
  return (
    <>
      {/* Solid deep dark base */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: "#04080f" }} />

      {/* Mesh gradients */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 10% -10%, rgba(99,102,241,0.18) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 90% 110%, rgba(124,58,237,0.14) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(6,11,24,0.9) 0%, transparent 100%)
          `,
        }}
      />

      {/* Floating orbs */}
      <div className="orb" style={{ width: 800, height: 800, top: "-200px", left: "-200px", background: "#6366f1", opacity: 0.09 }} />
      <div className="orb" style={{ width: 600, height: 600, bottom: "-150px", right: "-150px", background: "#7c3aed", opacity: 0.09 }} />
      <div className="orb" style={{ width: 400, height: 400, top: "40%", left: "50%", background: "#06b6d4", opacity: 0.05 }} />

      {/* Fine dot grid overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(99,102,241,0.15) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          opacity: 0.5,
        }}
      />
    </>
  );
}
