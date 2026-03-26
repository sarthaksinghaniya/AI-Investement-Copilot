/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        xl: '1rem',
      },
      boxShadow: {
        xl: '0 10px 30px rgba(2,6,23,0.08)',
        soft: '0 6px 18px rgba(11, 20, 50, 0.06)'
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
      },
      transitionDuration: {
        250: '250ms',
      }
    },
  },
  plugins: [],
}
