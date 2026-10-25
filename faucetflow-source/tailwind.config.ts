import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d17",
        card: "#131627",
        neon: { blue: "#38bdf8", purple: "#a78bfa", green: "#4ade80" },
      },
    },
  },
  plugins: [],
};
export default config;
