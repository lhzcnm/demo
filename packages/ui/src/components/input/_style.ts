import { tv } from 'tailwind-variants'

export const style = tv({
  slots: {
    root: [
      'inline-flex items-center w-full h-10 sm:h-9 rounded overflow-hidden',
      'border border-input hover:border-hover shadow-sm transition-colors',
      'focus-within:ring-1 focus-within:ring-primary',
    ],
    input: 'size-full px-3 text-sm bg-transparent focus:outline-none',
    icon: [
      'flex items-center justify-center',
      'flex-shrink-0 m-1 size-7 text-muted-foreground',
    ],
    clear: [
      'flex items-center justify-center',
      'flex-shrink-0 m-1 size-7 hover:bg-muted rounded',
      'text-muted-foreground hover:text-foreground',
    ],
  },
  variants: {
    hasIcon: {
      true: {
        input: 'pl-0'
      }
    },
    clearable: {
      true: {
        input: 'pr-0'
      }
    },
    disabled: {
      true: {
        root: 'bg-muted text-muted-foreground hover:border-input shadow-none',
        input: 'bg-muted text-muted-foreground',
        clear: 'hover:text-muted-foreground',
      }
    }
  },
})
