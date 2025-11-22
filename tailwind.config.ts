// Design System: Modern cohesive styling for WanderNest
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        'border-subtle': 'hsl(var(--border-subtle))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Modern Color System: Muted blues, violets, and sand tones
        'ui-blue': {
          primary: 'hsl(var(--ui-blue-primary))',
          secondary: 'hsl(var(--ui-blue-secondary))',
          accent: 'hsl(var(--ui-blue-accent))',
        },
        'ui-purple': {
          primary: 'hsl(var(--ui-purple-primary))',
          secondary: 'hsl(var(--ui-purple-secondary))',
          accent: 'hsl(var(--ui-purple-accent))',
        },
        'ui-sand': {
          light: 'hsl(var(--ui-sand-light))',
          DEFAULT: 'hsl(var(--ui-sand))',
          dark: 'hsl(var(--ui-sand-dark))',
        },
        'ui-success': 'hsl(var(--ui-success))',
        'ui-warning': 'hsl(var(--ui-warning))',
        'ui-error': 'hsl(var(--ui-error))',
        'ui-info': 'hsl(var(--ui-info))',

        // Semantic color tokens
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          elevated: 'hsl(var(--surface-elevated))',
        },
      },
      // Cohesive border radius scale
      borderRadius: {
        xs: '0.25rem',   // 4px - small badges
        sm: '0.375rem',  // 6px - inputs, small buttons
        DEFAULT: '0.5rem', // 8px - default radius
        md: '0.75rem',   // 12px - cards, larger buttons
        lg: '1rem',      // 16px - prominent cards
        xl: '1.25rem',   // 20px - hero cards
        '2xl': '1.5rem', // 24px - feature sections
        '3xl': '2rem',   // 32px - large hero elements
      },
      // Unified spacing scale (extends default)
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      // Modern shadow system
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 2px 6px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.1)',
        'elevated': '0 20px 60px -15px rgba(0, 0, 0, 0.2), 0 4px 15px -3px rgba(0, 0, 0, 0.15)',
        'glow-blue': '0 0 30px hsla(215, 75%, 55%, 0.4), 0 10px 40px -10px hsla(215, 75%, 55%, 0.3)',
        'glow-purple': '0 0 30px hsla(265, 70%, 55%, 0.4), 0 10px 40px -10px hsla(265, 70%, 55%, 0.3)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      // Typography scale
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
        'h2': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h3': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
        'h4': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h5': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h6': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.005em', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '-0.011em', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
      },
    },
  },
  plugins: [
    function({ addUtilities }: any) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      }
      addUtilities(newUtilities)
    }
  ],
}
export default config
