import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      paper: { DEFAULT: "#F4F0E8", 50: "#FBF9F4", 100: "#F7F3EC", 200: "#EEE8DC", 300: "#E4DCCB" },
      ink: { DEFAULT: "#1B1A16", 900: "#1B1A16", 700: "#3A382F", 500: "#6B675B", 400: "#8C8779" },
      silk: { lav: "#C7B8F5", peri: "#A9B8FF", sky: "#9FD0FF", mint: "#B7ECD6", blush: "#FFC4D6", peach: "#FFD3AE" },
      accent: { DEFAULT: "#5b5bd6", 600: "#4f46e5" },
    },
    fontFamily: {
      sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      serif: ["var(--font-serif)", "Georgia", "serif"],
    },
    boxShadow: {
      soft: "0 1px 2px rgba(27,26,22,0.04), 0 10px 30px -12px rgba(27,26,22,0.12)",
      lift: "0 1px 2px rgba(27,26,22,0.05), 0 24px 60px -20px rgba(27,26,22,0.22)",
      pill: "0 1px 2px rgba(27,26,22,0.18), 0 8px 20px -6px rgba(27,26,22,0.28)",
    },
    keyframes: {
      "silk-1": { "0%,100%": { transform: "translate3d(-8%,-4%,0) rotate(0deg) scale(1.05)" }, "50%": { transform: "translate3d(10%,6%,0) rotate(40deg) scale(1.25)" } },
      "silk-2": { "0%,100%": { transform: "translate3d(8%,4%,0) rotate(0deg) scale(1.1)" }, "50%": { transform: "translate3d(-10%,-6%,0) rotate(-50deg) scale(1.3)" } },
      "silk-3": { "0%,100%": { transform: "translate3d(0,8%,0) rotate(0deg) scale(1.1)" }, "50%": { transform: "translate3d(-6%,-8%,0) rotate(30deg) scale(1.2)" } },
      float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      "marquee-rev": { "0%": { transform: "translateX(-50%)" }, "100%": { transform: "translateX(0)" } },
      "spin-slow": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
      shimmer: { "0%": { transform: "translateX(-120%)" }, "100%": { transform: "translateX(220%)" } },
      eq: { "0%,100%": { transform: "scaleY(0.3)" }, "50%": { transform: "scaleY(1)" } },
      "pulse-ring": { "0%": { transform: "scale(0.8)", opacity: "0.6" }, "100%": { transform: "scale(2.2)", opacity: "0" } },
    },
    animation: {
      "silk-1": "silk-1 22s ease-in-out infinite", "silk-2": "silk-2 26s ease-in-out infinite", "silk-3": "silk-3 30s ease-in-out infinite",
      float: "float 6s ease-in-out infinite", marquee: "marquee 38s linear infinite", "marquee-slow": "marquee 60s linear infinite",
      "marquee-rev": "marquee-rev 46s linear infinite", "spin-slow": "spin-slow 26s linear infinite",
      shimmer: "shimmer 3.5s ease-in-out infinite", "pulse-ring": "pulse-ring 2.4s ease-out infinite",
    },
  } },
  plugins: [],
};
export default config;
