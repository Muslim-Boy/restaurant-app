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
          DEFAULT: '#f7f9fb',
          container: '#efedf5',
          'container-high': '#e6e8ea',
          'container-highest': '#e3e1e9',
        },
        'on-surface': '#191c1e',
        outline: {
          DEFAULT: '#434655',
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
          container: '#dcfce7',
        },
        warning: {
          DEFAULT: '#c2410c',
          container: '#ffedd5',
        },
        purple: {
          DEFAULT: '#7e22ce',
          container: '#f3e8ff',
        },
        border: '#eceef0',
        'tab-bg': '#f2f4f6',
        muted: '#6b7280',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.05)',
        'card-border': '0 1px 2px rgba(30,58,138,0.05)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.06)',
        'primary-glow': '0 4px 6px -1px rgba(0,74,198,0.2), 0 2px 4px -2px rgba(0,74,198,0.2)',
        'tab': '0 1px 2px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
