import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default.
  // pdfjs-dist is dynamically imported in "use client" components only,
  // so no special canvas aliasing is needed — the browser build handles it.
  turbopack: {},
};

export default nextConfig;
