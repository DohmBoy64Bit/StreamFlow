/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          black: '#141414',
          gray: {
            DEFAULT: '#808080',
            light: '#B3B3B3',
            dark: '#2F2F2F',
          }
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
