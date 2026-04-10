/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Outfit', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#4FB3FF', // Sky Blue Custom
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#4FB3FF',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        charcoal: {
          50: '#f4f4f4',
          100: '#e5e5e5',
          200: '#999999',
          300: '#666666',
          400: '#333333',
          500: '#1b1b1b',
          600: '#111111',
          700: '#0a0a0a',
          800: '#0F0F0F', // New Background
          900: '#000000',
          950: '#000000',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0c',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-once': 'pulse 0.6s ease',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
