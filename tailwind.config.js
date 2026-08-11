/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#050816",
        card: "#0B1220",
        primary: "#00D4FF",
        secondary: "#5EEBFF",
        accent: "#3B82F6",
        text: "#FFFFFF",
        muted: "#9CA3AF",
        success: "#22C55E",
        danger: "#EF4444",
      },
      fontFamily: {
        geist: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
