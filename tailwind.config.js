/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Игровая палитра в стиле блокчейн
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        blockchain: {
          dark: '#0f172a',
          light: '#1e293b',
          accent: '#0ea5e9',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        game: {
          bg: '#020817',
          panel: '#1e293b',
          border: '#334155',
          text: '#f1f5f9',
          accent: '#0ea5e9',
        }
      },
      fontFamily: {
        code: ['Fira Code', 'monospace'],
        game: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #0ea5e9' },
          '100%': { boxShadow: '0 0 20px #0ea5e9, 0 0 30px #0ea5e9' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 