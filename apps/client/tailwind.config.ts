import { withTV } from 'tailwind-variants/transformer'
import { preset } from '@3un/ui/preset'
import { resolve } from 'node:path'

const uiPath = resolve('../../packages/ui')
const uiContent = resolve(uiPath, 'src/**/*.{vue,ts}')

export default withTV({
  content: [
    'index.html',
    'src/**/*.{vue,ts}',
    uiContent,
  ],
  presets: [preset],
  theme: {
    extend: {
      width: {
        'sidebar': 'var(--siderbar-w)',
        'container': 'calc(100vw - var(--siderbar-w))',
      },
      height: {
        'header': 'var(--header-h)',
        'container': 'calc(100vh - var(--header-h))',

        'mobile-header': 'var(--mobile-header-h)',
        'mobile-footer': 'var(--mobile-footer-h)',
        'store-header': 'var(--store-header-h)',
        'store-container': 'calc(100vh - var(--store-header-h))',
      },
      maxWidth: {
        'container': 'calc(100vw - var(--siderbar-w))',
      },

      keyframes: {
        'scale-check': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'circle-expand': {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'arrow': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(6px)' },
        },
      },
      animation: {
        'scale-check': 'scale-check 0.5s ease-out forwards',
        'circle-expand': 'circle-expand 0.8s ease-out forwards',
        'fade-up': 'fade-up 0.5s ease-out 0.3s forwards',
        'fadeIn': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'arrow-move': 'arrow 0.8s cubic-bezier(0.25, 1, 0.5, 1) infinite'
      },
    },
  },
})