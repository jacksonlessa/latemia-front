import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4E8C75',
          light: '#EAF4F0',
          bg: '#F4F9F7',
        },
        surface: '#FFFFFF',
        copy: '#2C2C2E',
        'copy-secondary': '#6B6B6E',
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        error: {
          DEFAULT: '#C94040',
          light: '#FDECEA',
        },
        muted: '#F0F0F0',
      },
    },
  },
  plugins: [],
};

export default config;
