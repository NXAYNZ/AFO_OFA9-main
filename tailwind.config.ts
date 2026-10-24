import type { Config } from "tailwindcss";

// TripSure palette: every stock Tailwind hue used in the app folds into five roles so the
// whole product reads as one system. Stone/ink neutrals, Andaman lagoon (action, success),
// gulf blue (information, weather), saffron (money, tiers), terracotta (penalties, errors).
// Palettes resolve through CSS variables (globals.css) so a theme class can repaint the whole app
const palette = (name: string) =>
  Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((k) => [k, `rgb(var(--c-${name}-${k}) / <alpha-value>)`]));
const ink = palette("ink");
const lagoon = palette("lagoon");
const gulf = palette("gulf");
const saffron = palette("saffron");
const terracotta = palette("terracotta");

// Landing page (blue & white travel-tech). Separate names so neither the remap above
// nor the dark-theme sheet ever touches them.
const tsb = { 50: "#EFF6FF", 100: "#DBEAFE", 200: "#BFDBFE", 300: "#93C5FD", 400: "#4C8DFF", 500: "#1A6BFF", 600: "#0057FF", 700: "#1D4ED8", 800: "#1E3A8A" };
const tsn = { 0: "#FFFFFF", 50: "#F8FAFC", 100: "#F1F5F9", 200: "#E2E8F0", 300: "#CBD5E1", 400: "#94A3B8", 500: "#64748B", 600: "#475569", 700: "#334155", 800: "#1E293B", 900: "#0F172A", 950: "#0B192C" };
const tsg = { 50: "#ECFDF5", 100: "#D1FAE5", 500: "#10B981", 600: "#059669", 700: "#047857" };
const tsa = { 50: "#FFFBEB", 100: "#FEF3C7", 500: "#F59E0B", 600: "#D97706", 700: "#B45309" };

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        tsb,
        tsn,
        tsg,
        tsa,
        ink,
        lagoon,
        gulf,
        saffron,
        terracotta,
        slate: ink,
        gray: ink,
        emerald: lagoon,
        teal: lagoon,
        green: lagoon,
        lime: lagoon,
        brand: lagoon,
        indigo: gulf,
        indigoFintech: gulf,
        violet: gulf,
        purple: gulf,
        fuchsia: gulf,
        blue: gulf,
        sky: gulf,
        cyan: gulf,
        amber: saffron,
        yellow: saffron,
        orange: saffron,
        rose: terracotta,
        red: terracotta,
        pink: terracotta,
      },
      fontFamily: {
        sans: ["var(--font-ui)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-ui)", "serif"],
        prompt: ["var(--font-prompt)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
        // Figures in data use the UI face with tabular numerals (see globals.css), not a code face
        mono: ["var(--font-ui)", "system-ui", "sans-serif"],
        sarabun: ["var(--font-ui)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--r-sm, 3px)",
        DEFAULT: "var(--r-base, 4px)",
        md: "var(--r-md, 6px)",
        lg: "var(--r-lg, 8px)",
        xl: "var(--r-xl, 10px)",
        "2xl": "var(--r-2xl, 12px)",
        "3xl": "var(--r-3xl, 14px)",
      },
      boxShadow: {
        sm: "0 1px 2px rgb(19 35 58 / 0.06)",
        DEFAULT: "0 1px 3px rgb(19 35 58 / 0.08), 0 1px 2px rgb(19 35 58 / 0.04)",
        md: "0 4px 12px -4px rgb(19 35 58 / 0.12)",
        lg: "0 10px 24px -10px rgb(19 35 58 / 0.18)",
        xl: "0 18px 40px -16px rgb(19 35 58 / 0.24)",
        "2xl": "0 28px 64px -24px rgb(19 35 58 / 0.32)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
