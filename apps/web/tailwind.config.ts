import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        // Forest Green Luxury foundation
        forest: {
          900: '#051F20',
          800: '#0B2B26',
          700: '#163832',
          600: '#235347',
        },
        sage: {
          DEFAULT: '#8EB69B',
          light: '#A4C6AF',
          dark: '#6E987B',
        },
        mint: {
          DEFAULT: '#DAF1DE',
          light: '#EFF8F2',
          dark: '#BDE3C4',
        },

        // Energetic Saffron Amber CTA & Accent ("Josh")
        saffron: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },

        // Distinct Flatmate Pair
        shashikant: {
          DEFAULT: 'var(--teal)',
          subtle: 'var(--teal-subtle)',
        },
        nitesh: {
          DEFAULT: 'var(--plum)',
          subtle: 'var(--plum-subtle)',
        },
        ink: 'var(--ink)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        card: '22px',
        hero: '28px',
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['Figtree', 'sans-serif'],
        sans: ['Figtree', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(6, 29, 26, 0.05), 0 2px 6px -1px rgba(6, 29, 26, 0.03)',
        'card-hover': '0 10px 25px -3px rgba(6, 29, 26, 0.09), 0 4px 10px -2px rgba(6, 29, 26, 0.04)',
        raised: '0 8px 30px -4px rgba(245, 158, 11, 0.45)',
        josh: '0 10px 30px -4px rgba(245, 158, 11, 0.55), 0 4px 12px -2px rgba(245, 158, 11, 0.35)',
        'teal-glow': '0 8px 25px -4px rgba(13, 148, 136, 0.45)',
        'plum-glow': '0 8px 25px -4px rgba(99, 102, 241, 0.45)',
        'emerald-glow': '0 8px 25px -4px rgba(16, 185, 129, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
