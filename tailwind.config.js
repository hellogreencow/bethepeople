/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        electric: {
          blue: '#2407b3',
          'blue-light': '#3b82f6',
          'blue-dark': '#1e40af',
          red: '#DC2626',
          'red-light': '#EF4444',
          'red-dark': '#B91C1C',
        }
      }
    },
  },
  plugins: [],
};
