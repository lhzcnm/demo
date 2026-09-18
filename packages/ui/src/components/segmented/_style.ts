import { tv } from "tailwind-variants"

export const style = tv({
  slots: {
    root: 'relative p-1 rounded border shadow-sm',
    container: 'relative flex',
    indicator: [
      'absolute h-full rounded shadow-sm',
      'transition-transform duration-300 ease-in-out'
    ],
    button: [
      'relative flex-1 flex items-center justify-center space-x-1.5',
      'text-muted-foreground whitespace-nowrap transition-colors duration-300',
    ],
    icon: 'size-4',
  },
  variants: {
    color: {
      blue: {
        indicator: 'bg-primary',
      },
      teal: {
        indicator: 'bg-emerald-500',
      },
    },
    size: {
      sm: {
        button: 'px-2.5 text-xs h-7 sm:h-6',
        icon: 'size-3.5',
      },
      md: {
        button: 'px-3 text-sm h-9 sm:h-7',
        icon: 'size-4',
      },
    },
    isActive: {
      true: {
        button: 'text-white',
      }
    }
  },
  defaultVariants: {
    color: 'blue',
    size: 'md',
  }
})
