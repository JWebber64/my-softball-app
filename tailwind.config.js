/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '0.3125rem',
        'md': '0.625rem',
        'lg': '0.9375rem',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        }
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out'
      }
    }
  },
  plugins: [],
  corePlugins: {
    container: false // Disable Tailwind's container to prevent conflicts
  }
}
