import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211d",
        mist: "#f5f7f4",
        line: "#dce2dc",
        moss: "#4f6f52",
        coral: "#d86f51",
        gold: "#c59a3f"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 33, 29, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
