import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0056b3",
          "blue-dark": "#003d80",
          "blue-light": "#e8f0fb",
          gray: "#f5f7fa",
          "gray-mid": "#e2e8f0",
          "gray-text": "#64748b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        // 8px base rhythm
        "2": "0.5rem",   // 8px
        "4": "1rem",     // 16px
        "6": "1.5rem",   // 24px
        "8": "2rem",     // 32px
        "12": "3rem",    // 48px
        "16": "4rem",    // 64px
        "24": "6rem",    // 96px
      },
      borderRadius: {
        DEFAULT: "8px",
        "lg": "12px",
        "xl": "16px",
      },
    },
  },
  plugins: [],
};

export default config;
