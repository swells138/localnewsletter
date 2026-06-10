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
        ink: "#18211f",
        paper: "#fbfaf7",
        lake: "#216f80",
        leaf: "#527246",
        berry: "#a33e55",
        amber: "#c77a1f"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(24, 33, 31, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
