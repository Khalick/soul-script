/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Warm Dusk Theme - Soul Script Brand */
        soul: {
          coral: '#E07A5F',      /* Primary accent */
          gold: '#F2CC8F',       /* Secondary accent */
          sage: '#81B29A',       /* Tertiary accent */
          cream: '#FAF7F2',      /* Light background */
          charcoal: '#1A1A2E',   /* Dark background */
          text: '#3D3D3D',       /* Primary text */
        },
        primary: {
          50: '#fdf5f3',
          100: '#fbeae6',
          200: '#f7d5cc',
          300: '#f0b5a6',
          400: '#e8907b',
          500: '#E07A5F',        /* Main coral */
          600: '#c9624a',
          700: '#a84e3b',
          800: '#8a4234',
          900: '#723b30',
        },
        secondary: {
          50: '#fdfcf8',
          100: '#faf6eb',
          200: '#f5edd7',
          300: '#f2cc8f',        /* Main gold */
          400: '#e9b86a',
          500: '#dea04b',
          600: '#c98538',
          700: '#a6682f',
          800: '#87542c',
          900: '#6e4527',
        },
        accent: {
          50: '#f3f8f5',
          100: '#e3efe8',
          200: '#c8dfd2',
          300: '#a1c9b4',
          400: '#81B29A',        /* Main sage */
          500: '#5a9578',
          600: '#477862',
          700: '#3b6151',
          800: '#334f44',
          900: '#2c4239',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
