/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sillar: {
          DEFAULT: '#f5efe4',
          shadow: '#d9cfbc',
          line: '#c9bb8f',
        },
        granate: {
          DEFAULT: '#7a1b29',
          deep: '#5c121e',
        },
        gold: {
          DEFAULT: '#b8862d',
          soft: '#d4a843',
        },
        ink: {
          DEFAULT: '#2c2417',
          soft: '#7a6f5a',
        },
      },
      fontFamily: {
        serif: ['"Crimson Pro"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        settle: 'settle 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        'drop-in': 'dropIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        settle: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.99)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        dropIn: {
          '0%': { opacity: '0', transform: 'translateY(-28px) scale(0.92)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
