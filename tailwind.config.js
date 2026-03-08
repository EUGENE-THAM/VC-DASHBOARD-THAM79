/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#1E293B",
        accent: "#10B981",
        background: "#F8FAFC",
      },
    },
  },
  plugins: [],
}
