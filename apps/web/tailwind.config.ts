import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#080914',
        foreground: '#FFFFFF',
        sidebar: {
          DEFAULT: '#0B0C19',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#101120',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#101120',
          foreground: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#315BFF',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#15182B',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#15182B',
          foreground: '#737A95',
        },
        accent: {
          DEFAULT: '#477BFF',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        border: 'rgba(255, 255, 255, 0.08)',
        input: 'rgba(255, 255, 255, 0.08)',
        ring: '#315BFF',

        // Premium Dark Fintech Palette
        dark: {
          main: '#080914',
          sidebar: '#0B0C19',
          card: '#101120',
          secondary: '#15182B',
        },
        blue: {
          primary: '#315BFF',
          electric: '#477BFF',
          dark: '#1745D1',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A5BC',
          muted: '#737A95',
        },
        success: '#25D6B0',
        warning: '#FFBD59',

        // Flatmate Pair within fintech palette
        shashikant: {
          DEFAULT: '#25D6B0',
          subtle: 'rgba(37, 214, 176, 0.15)',
        },
        nitesh: {
          DEFAULT: '#818CF8',
          subtle: 'rgba(129, 140, 248, 0.15)',
        },
        ink: '#FFFFFF',
      },
      borderRadius: {
        lg: '1.25rem',
        md: '1rem',
        sm: '0.75rem',
        card: '24px',
        hero: '28px',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
        'card-hover': '0 12px 36px 0 rgba(49, 91, 255, 0.15), 0 0 0 1px rgba(71, 123, 255, 0.3)',
        raised: '0 8px 30px -4px rgba(49, 91, 255, 0.5)',
        josh: '0 10px 30px -4px rgba(49, 91, 255, 0.55)',
        glow: '0 0 25px -4px rgba(49, 91, 255, 0.45)',
        'glow-sm': '0 0 15px -3px rgba(49, 91, 255, 0.35)',
        'teal-glow': '0 8px 25px -4px rgba(37, 214, 176, 0.45)',
        'plum-glow': '0 8px 25px -4px rgba(129, 140, 248, 0.45)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1745D1 0%, #4169FF 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(21, 24, 43, 0.7) 0%, rgba(16, 17, 32, 0.95) 100%)',
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
