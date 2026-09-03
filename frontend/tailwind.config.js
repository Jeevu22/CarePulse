/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "warm-sage": "#F4F3ED",
        "warm-sage-alt": "#F2F0E6",
        "paper-white": "#FFFFFF",
        "paper-border": "#E5E3D8",
        "dark-slate": "#1E293B",
        "dark-slate-alt": "#293241",
        "sage-green": "#5E8152",
        "sage-green-light": "#6E8F5C",
        "coral": "#E0654A",
        "coral-light": "#D9534F",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Fraunces", "Playfair Display", "Georgia", "serif"],
        mono: ["var(--font-mono)", "Space Mono", "monospace"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
}
