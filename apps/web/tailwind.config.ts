import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        screenriot: {
          bg: '#0c1222',
          'bg-card': '#141c2e',
          'bg-elevated': '#1a2438',
          accent: '#eab308',
          'accent-blue': '#38bdf8',
          muted: '#94a3b8',
        },
      },
    },
  },
  plugins: [],
};

export default config;
