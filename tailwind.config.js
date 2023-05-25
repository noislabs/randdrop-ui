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
        'nois-blue': "#0c0914",
        'nois-white': "#e0daee"
      },
      boxShadow: {
        'neon-sm': '0 0 3px 2px #6ff2cf20',
        'neon-md': '0 0 6px 3px #6ff2cf50',
        'this_is_outside_the_border': '0 0 0px 0px #FF0000'
    },
    },
  },
  plugins: [],
}
