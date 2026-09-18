import { tv } from 'tailwind-variants'

export const style = tv({
  slots: {
    base: [
      'flex items-center w-fit',
      'border border-input hover:border-hover',
      'rounded focus-within:ring-1 focus-within:ring-primary',
    ],
    input: [
      'px-2 h-full border-x focus:outline-none',
      'text-sm text-center bg-transparent',
    ],
    button: [
      'flex items-center justify-center',
      'flex-shrink-0 hover:bg-muted rounded text-center',
      'text-muted-foreground hover:text-foreground',
    ],
  },
  variants: {
    size: {
      sm: {
        input: 'w-12',
        button: 'm-1 size-5',
        base: 'h-7',
      },
      md: {
        input: 'w-14',
        button: 'm-1 size-6',
        base: 'h-8',
      },
      lg: {
        input: 'w-16',
        button: 'm-1 size-7',
        base: 'h-10 sm:h-9',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
