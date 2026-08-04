import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1b2d",
        mist: "#f0f5fa",
        line: "#d5e0ea",
        moss: "#2f5d8a",
        coral: "#3b82c4",
        gold: "#6ea8d8"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 27, 45, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
