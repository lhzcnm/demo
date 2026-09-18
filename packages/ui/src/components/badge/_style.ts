import { tv } from 'tailwind-variants'

export const style = tv({
  base: [
    'inline-flex items-center justify-center',
    'text-xs text-white rounded-full px-1.5',
  ],
  variants: {
    color: {
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
    },
    size: {
      sm: 'min-w-4 h-4',
      md: 'min-w-5 h-5',
    },
  },
  defaultVariants: {
    color: 'primary',
    size: 'md',
  },
})
