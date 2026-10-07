import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        upay: {
          50: "#eefbf3",
          100: "#d7f6e2",
          200: "#b2eecb",
          300: "#7ee1ac",
          400: "#44cb86",
          500: "#1eb067",
          600: "#128f51",
          700: "#0f7142",
          800: "#00552b", // Deep primary fintech green
          900: "#034524",
          950: "#012613",
        },
        surface: {
          DEFAULT: "#ffffff",
          subtle: "#f8faf9",
          muted: "#f1f5f3",
          border: "#e5ece8",
        },
        fintech: {
          navy: "#0f172a",
          slate: "#334155",
          danger: "#e11d48",
          warning: "#f59e0b",
          info: "#0284c7",
          success: "#059669",
        }
      },
      boxShadow: {
        fintech: "0 1px 3px 0 rgba(0, 40, 20, 0.05), 0 1px 2px -1px rgba(0, 40, 20, 0.05)",
        card: "0 4px 20px -2px rgba(3, 51, 27, 0.06)",
        cardHover: "0 10px 25px -4px rgba(3, 51, 27, 0.12)",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
