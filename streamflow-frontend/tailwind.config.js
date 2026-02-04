/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        streamflow: {
          cyan: '#00FFFF',
          blue: '#0047AB',
          amber: '#FFBF00',
          navy: '#0a0b1e',
          'navy-light': '#161b33',
        },
        netflix: {
          red: '#E50914',
          black: '#141414',
          gray: {
            DEFAULT: '#808080',
            light: '#B3B3B3',
            dark: '#2F2F2F',
          }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'cyan-glow': '0 0 15px rgba(0, 255, 255, 0.4)',
        'cyan-glow-intense': '0 0 25px rgba(0, 255, 255, 0.6)',
        'blue-glow': '0 0 15px rgba(0, 71, 171, 0.4)',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
