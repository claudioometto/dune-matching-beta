/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 1s ease-in-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { 
            textShadow: '0 0 20px rgba(251, 191, 36, 0.5), 0 0 30px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.2)' 
          },
          '100%': { 
            textShadow: '0 0 30px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.5), 0 0 50px rgba(251, 191, 36, 0.3)' 
          },
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      letterSpacing: {
        'widest': '0.3em',
      }
    },
  },
  plugins: [],
};