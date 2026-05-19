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
        cinnabar: "#9f1d1d",
        wine: "#631313",
        gold: "#d7ad57",
        ivory: "#fff8ec"
      },
      boxShadow: {
        glow: "0 0 34px rgba(215, 173, 87, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
