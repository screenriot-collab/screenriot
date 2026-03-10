/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: '#0f172a',
          sidebar: '#1e293b',
          card: '#334155',
          accent: '#38bdf8',
        },
      },
    },
  },
  plugins: [],
};
