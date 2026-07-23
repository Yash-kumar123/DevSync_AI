/** @type {import('tailwindcss').Config} */
export default {
  // -------------------------------------------------------------------------
  // Content — Tailwind scans only these files to generate its utility classes.
  // This keeps the production bundle as small as possible.
  // -------------------------------------------------------------------------
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  // -------------------------------------------------------------------------
  // Dark mode — class strategy lets us toggle dark mode via a .dark class
  // on the <html> element, controlled by our ThemeContext.
  // -------------------------------------------------------------------------
  darkMode: 'class',

  theme: {
    extend: {
      // -------------------------------------------------------------------
      // Design tokens — centralised colour palette for DevSync AI.
      // All colours reference CSS custom properties so they can be
      // dynamically swapped without rebuilding Tailwind.
      // -------------------------------------------------------------------
      colors: {
        // Brand
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
        },
        // Surface (backgrounds, cards, panels)
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          overlay: 'var(--color-surface-overlay)',
        },
        // Semantic
        border: 'var(--color-border)',
        muted: 'var(--color-muted)',
      },

      // -------------------------------------------------------------------
      // Typography
      // -------------------------------------------------------------------
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      // -------------------------------------------------------------------
      // Spacing & sizing
      // -------------------------------------------------------------------
      spacing: {
        18: '4.5rem',
        112: '28rem',
        128: '32rem',
      },

      // -------------------------------------------------------------------
      // Border radius
      // -------------------------------------------------------------------
      borderRadius: {
        '4xl': '2rem',
      },

      // -------------------------------------------------------------------
      // Animation & keyframes
      // -------------------------------------------------------------------
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'slide-down': 'slide-down 0.25s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
      },

      // -------------------------------------------------------------------
      // Shadows
      // -------------------------------------------------------------------
      boxShadow: {
        'glow-brand': '0 0 20px -4px var(--color-brand-500)',
        'glow-sm': '0 0 8px -2px var(--color-brand-400)',
      },
    },
  },

  plugins: [],
};
