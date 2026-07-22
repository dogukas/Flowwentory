/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'tilt': 'tilt 10s infinite linear',
        'float': 'float 8s infinite ease-in-out',
        'shimmer': 'shimmer 3s infinite linear',
        'fade-in': 'fadeIn 1s ease-out',
        'soft-float': 'softFloat 12s infinite ease-in-out',
        'soft-fade-in': 'softFadeIn 1.5s ease-out',
        'soft-fade-in-delayed': 'softFadeIn 1.5s ease-out 0.5s forwards',
      },
      keyframes: {
        'tilt': {
          '0%, 100%': {
            transform: 'rotate(-3deg) scale(1.2)',
          },
          '50%': {
            transform: 'rotate(3deg) scale(1.3)',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0) scale(1)',
            opacity: '0.3',
          },
          '50%': {
            transform: 'translateY(-20px) scale(1.1)',
            opacity: '0.5',
          },
        },
        'shimmer': {
          '0%': {
            'background-position': '200% 0',
          },
          '100%': {
            'background-position': '-200% 0',
          },
        },
        'fadeIn': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'softFloat': {
          '0%, 100%': {
            transform: 'translateY(0) scale(1)',
            opacity: '0.1',
          },
          '50%': {
            transform: 'translateY(-20px) scale(1.05)',
            opacity: '0.15',
          },
        },
        'softFadeIn': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      backgroundImage: {
        'grid-slate-800': 'linear-gradient(to right, rgb(30 41 59 / 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgb(30 41 59 / 0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
} 