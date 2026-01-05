import type { Config } from "tailwindcss";

export default {
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
        primary: {
          DEFAULT: "#FF6B35",
          50: "#FFF4F0",
          100: "#FFE4DB",
          200: "#FFC4B0",
          300: "#FFA385",
          400: "#FF875D",
          500: "#FF6B35",
          600: "#E84D14",
          700: "#B13B0F",
          800: "#7A290A",
          900: "#431706",
        },
        accent: {
          DEFAULT: "#00D4AA",
          50: "#E6FFF9",
          100: "#B3FFEC",
          200: "#80FFE0",
          300: "#4DFFD3",
          400: "#1AFFC7",
          500: "#00D4AA",
          600: "#00A888",
          700: "#007C66",
          800: "#005044",
          900: "#002422",
        },
        tier: {
          goat: "#FFD700",
          god: "#FF6B35",
          enjoyable: "#00D4AA",
          mediocre: "#8B8B8B",
          weak: "#4A4A4A",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-bebas)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 107, 53, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 107, 53, 0.6)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
