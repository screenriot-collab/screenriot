import type { Config } from 'tailwindcss';

/** Brand palette aligned with Figma Make (SCREENRIOT1). */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        screenriot: {
          bg: '#0a0e17',
          'bg-card': '#141821',
          'bg-elevated': '#1a1f2e',
          /** Gold — highlights, stars, secondary emphasis */
          accent: '#d4af37',
          /** Primary blue — CTAs, links, progress, active filters */
          'accent-blue': '#2563eb',
          muted: '#9ca3af',
          red: '#dc2626',
        },
      },
    },
  },
  plugins: [],
};

export default config;
