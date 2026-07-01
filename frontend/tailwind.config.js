/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        card: '#161D2C',
        primary: '#4F46E5', // Indigo-600
        accent: '#38BDF8', // Light blue
        success: '#10B981', // Emerald
      }
    },
  },
  plugins: [],
}
