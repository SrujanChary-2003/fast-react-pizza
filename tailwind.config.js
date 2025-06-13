/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Roboto Mono', 'monospace'], // corrected typo from "nonespace"
    },
    extend: {},
  },
  plugins: [],
};
