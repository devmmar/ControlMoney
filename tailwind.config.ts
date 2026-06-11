import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        success: {
          DEFAULT: '#10b981',
          light:   '#d1fae5',
          text:    '#065f46',
        },
        danger: {
          DEFAULT: '#ef4444',
          light:   '#fee2e2',
          text:    '#991b1b',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light:   '#fef3c7',
          text:    '#92400e',
        },
        info: {
          DEFAULT: '#3b82f6',
          light:   '#dbeafe',
          text:    '#1e40af',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
