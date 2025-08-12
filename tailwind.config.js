/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        codisec: {
          blue: '#003366',
          white: '#ffffff',
          red: '#cc0000',
          accent: '#0077cc',
          grayLight: '#f4f6f8',
          grayDark: '#333333',
        },
      },
      fontFamily: {
        sans: [
          'Segoe UI',
          'Roboto',
          'system-ui',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        codisec: '6px',
      },
      boxShadow: {
        codisec: '0 2px 4px rgba(0,0,0,0.1)',
      },
      transitionProperty: {
        codisec: 'all',
      },
    },
  },
  plugins: [],
};
