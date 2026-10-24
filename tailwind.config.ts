import type { Config } from "tailwindcss";

// TripSure palette: every stock Tailwind hue used in the app folds into five roles so the
// whole product reads as one system. Stone/ink neutrals, Andaman lagoon (action, success),
// gulf blue (information, weather), saffron (money, tiers), terracotta (penalties, errors).
const ink = {
  50: "#f5f4f0",
  100: "#ecebe5",
  200: "#dddad1",
  300: "#c4c0b5",
  400: "#8f9196",
  500: "#5f6876",
  600: "#475163",
  700: "#343e4f",
  800: "#212c3d",
  900: "#13233a",
  950: "#0a1422",
};
const lagoon = {
  50: "#ebf4f1",
  100: "#d1e7e2",
  200: "#a5d1c8",
  300: "#6fb4a8",
  400: "#3b978a",
  500: "#1a7d71",
  600: "#126c61",
  700: "#0e5951",
  800: "#0c4741",
  900: "#0b3a35",
  950: "#062521",
};
const gulf = {
  50: "#eef2f7",
  100: "#dce4ef",
  200: "#bccadd",
  300: "#8fa6c4",
  400: "#6683a8",
  500: "#456590",
  600: "#34507a",
  700: "#2a4165",
  800: "#213352",
  900: "#1a2942",
  950: "#111b2d",
};
const saffron = {
  50: "#fbf4e8",
  100: "#f6e5c6",
  200: "#edcb8e",
  300: "#e2ae57",
  400: "#d69533",
  500: "#c27f1e",
  600: "#a66817",
  700: "#855215",
  800: "#6a4216",
  900: "#573716",
  950: "#321d08",
};
const terracotta = {
  50: "#fbefec",
  100: "#f6dcd5",
  200: "#edb9ac",
  300: "#e08f7c",
  400: "#d06a53",
  500: "#bc4d36",
  600: "#a13d29",
  700: "#833223",
  800: "#6a2a1f",
  900: "#57251c",
  950: "#2f110c",
};

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
        // Figures in data use the UI face with tabular numerals (see globals.css), not a code face
        mono: ["var(--font-ui)", "system-ui", "sans-serif"],
        sarabun: ["var(--font-ui)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "12px",
        "3xl": "14px",
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
