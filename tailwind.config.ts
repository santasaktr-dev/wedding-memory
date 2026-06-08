import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1F44",
          soft: "#17355F"
        },
        tweed: {
          DEFAULT: "#7C5C3B",
          soft: "#A88964"
        },
        camel: {
          DEFAULT: "#D6C8A5",
          pale: "#E8DEC6"
        },
        ash: {
          DEFAULT: "#B8B8B8",
          pale: "#E5E0D6"
        },
        ivory: {
          DEFAULT: "#F8F5EF",
          warm: "#FFFDF8"
        }
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-noto-sans-thai)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 45px rgba(10, 31, 68, 0.08)"
      },
      borderRadius: {
        card: "20px"
      },
      keyframes: {
        "ken-burns": {
          "0%": { transform: "scale(1) translate(0, 0)" },
          "50%": { transform: "scale(1.08) translate(-1%, 0.5%)" },
          "100%": { transform: "scale(1) translate(0, 0)" }
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(15px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "scale-up": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      animation: {
        "ken-burns": "ken-burns 24s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "scale-up": "scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      }
    }
  },
  plugins: []
};

export default config;
