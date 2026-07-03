import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#080e1a",
          900: "#0b1220",
          850: "#0e1729",
          800: "#111c33",
          700: "#1a2842",
        },
        charcoal: "#161b22",
        ivory: "#f4f1ea",
        gold: {
          DEFAULT: "#e9c176",
          bright: "#f3d494",
          dim: "#b28f4d",
        },
        line: "#233250",
        muted: "#8fa0bd",
        emeraldx: "#2fbf8f",
        danger: "#e5545e",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(233,193,118,0.06) inset, 0 12px 32px rgba(0,0,0,0.35)",
        glow: "0 0 24px rgba(233,193,118,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
