/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'nois-blue': "#0C0914",
        'nois-white': "#e0daee",
        'nois-green': "#6ff2cf"
      },
      boxShadow: {
        'neon-sm': '0 0 3px 2px #6ff2cf20',
        'neon-md': '0 0 6px 3px #6ff2cf50',
        'neon-white-md': '0 0 6px 3px #e0daee50',
        'this_is_outside_the_border': '0 0 0px 0px #FF0000'
      },
      keyframes: {
        flash: {
          '0%': { opacity: '0.2' },
          '20%': { opacity: '1' },
          '100%': { opacity: '0.2' },
        },
      },
      animation: {
        flash: 'flash 1.4s infinite linear',
      },
    },
  },
  variants: {
    fill: ['hover', 'focus'],
  },
  plugins: [],
}
