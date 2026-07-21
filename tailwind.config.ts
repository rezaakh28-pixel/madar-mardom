import type { Config } from "tailwindcss";

// Design tokens for مدار مردم (Madar-e Mardom)
// Palette: navy (primary / authority, trust), orange (secondary / human warmth, alert),
// off-white background (calm reading surface), near-black text (long-form legibility).
const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1360px",
      },
    },
    extend: {
      colors: {
        // Brand
        navy: {
          DEFAULT: "#17324D",
          50: "#EAF0F5",
          100: "#CFDCE7",
          200: "#A3BBCF",
          300: "#7799B6",
          400: "#4D799E",
          500: "#2E5A82",
          600: "#1F4566",
          700: "#17324D", // brand primary
          800: "#112538",
          900: "#0B1824",
        },
        orange: {
          DEFAULT: "#C77A29",
          50: "#FBF1E7",
          100: "#F5DFC4",
          200: "#EBC08A",
          300: "#E0A254",
          400: "#D68C39",
          500: "#C77A29", // brand secondary
          600: "#A6621F",
          700: "#7E4B18",
          800: "#573411",
          900: "#331E09",
        },
        surface: "#F7F8FA",
        ink: "#202124",

        // shadcn-style semantic tokens (mapped to CSS vars so dark mode works)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        rise: "#1E7A4C",
        fall: "#B23B3B",
      },
      fontFamily: {
        // Vazirmatn: Persian display + body. Inter: Latin fallback + numerals/data.
        vazir: ["var(--font-vazirmatn)", "Tahoma", "sans-serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Signature motif for "نبض جامعه" (Pulse of Society): a slow ECG-style sweep.
        pulse-sweep: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.4)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-sweep": "pulse-sweep 3.5s linear infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
