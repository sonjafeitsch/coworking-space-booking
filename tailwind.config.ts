import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["SourceSansPro", "sans-serif"],
      serif: ["PlayfairDisplay", "serif"],
    },
    extend: {
      colors: {
        "meine-nische-background": "#fffcf6",
        "themed-text": "#a3b6a0",
        "themed-base-text": "#5e6860",
        "bg-primary": "#a3b6a0",
      },
    },
  },
  plugins: [],
} satisfies Config;
