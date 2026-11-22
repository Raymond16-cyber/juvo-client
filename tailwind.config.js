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
        background: "var(--bg)",
        surface: "var(--surface)",
        card: "var(--card)",
        primary: "var(--primary)",
        "primary-strong": "var(--primary-strong)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        profit: "var(--profit)",
        loss: "var(--loss)",
        warning: "var(--warning)",
      },
      fontFamily: {
        saira: ["var(--font-saira)", "ui-sans-serif", "system-ui", "sans-serif"],
        geist: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        control: "var(--radius-control)",
        card: "var(--radius-card)",
      },
      boxShadow: {
        juvo: "var(--shadow)",
      },
      ringColor: {
        juvo: "var(--ring)",
      },
    },
  },
  plugins: [],
};
