/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#545e46',
        secondary: '#2d3436',
      },
    },
  },
  plugins: [],
  // Important to prevent conflicts with Chakra UI
  important: true,
}
