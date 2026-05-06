import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0a0a0f",
          surface: "#10101a",
          elevated: "#16162a",
        },
        accent: {
          DEFAULT: "#4f7cff",
          muted: "#2a3f80",
          silver: "#a8b4cc",
        },
        backdrop: {
          top: "transparent",
          mid: "rgba(10, 10, 15, 0.6)",
          base: "#0a0a0f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
