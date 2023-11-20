/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false
  },
  theme: {
    screens: {
      '2xl': { max: '1535px' },
      // => @media (max-width: 1535px) { ... }

      xl: { max: '1279px' },
      // => @media (max-width: 1279px) { ... }

      lg: { max: '1023px' },
      // => @media (max-width: 1023px) { ... }

      md: { max: '767px' },
      // => @media (max-width: 767px) { ... }

      sm: { max: '639px' }
      // => @media (max-width: 639px) { ... }
    },
    extend: {
      boxShadow: {
        '3xl': '0px 8px 32px 0px rgba(0, 0, 0, 0.16)'
      }
    }
  },
  plugins: []
}
