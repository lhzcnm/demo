import type { Config } from 'tailwindcss'

export const preset: Config = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--danger))',

        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        card: 'hsl(var(--card))',
        popover: 'hsl(var(--popover))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',

        // use for label text color
        label: 'hsl(var(--label-text))',

        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      ringColor: {
        DEFAULT: 'hsl(var(--primary))',
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
        hover: 'hsl(var(--input-hover))',
      },
      boxShadow: {
        'table-fixed': '-4px 0px 6px -1px hsl(var(--foreground) / 0.1)',
      },
      keyframes: {
        'bulletin-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'bulletin-scroll': 'bulletin-scroll 25s linear infinite',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }
    },
  },
}
