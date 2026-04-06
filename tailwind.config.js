/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#004ac6',
          container: '#2563eb',
          fixed: '#dbe1ff',
          'fixed-dim': '#b4c5ff',
        },
        surface: {
          DEFAULT: '#faf8ff',
          container: '#efedf5',
          'container-high': '#e9e7ef',
          'container-highest': '#e3e1e9',
        },
        'on-surface': '#191c1e',
        outline: {
          DEFAULT: '#737686',
          variant: '#c3c6d7',
        },
        tertiary: {
          DEFAULT: '#943700',
          container: '#ffdbcb',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        success: {
          DEFAULT: '#006e2c',
          container: '#9cf8a2',
        },
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.06)',
        'primary-glow': '0 4px 14px 0 rgba(0,74,198,0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
