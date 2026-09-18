import { tv } from "tailwind-variants"

export const style = tv({
  slots: {
    root: [
      'inline-flex items-center justify-center',
      'whitespace-nowrap rounded overflow-hidden transition-colors',
    ],

    button: 'inline-flex items-center space-x-1.5 text-white border-r border-black/20',
    buttonIcon: 'size-4',

    trigger: 'text-white',

    content: 'flex flex-col space-y-1 min-w-28 p-1',
    divider: 'h-px bg-border',
    option: [
      'flex items-center space-x-1.5 text-sm',
      'rounded px-2 py-1 hover:bg-muted transition-colors',
    ],
  },
  variants: {
    color: {
      primary: {
        button: 'bg-primary hover:bg-primary/85',
        trigger: 'bg-primary hover:bg-primary/85',
      },
      success: {
        button: 'bg-success hover:bg-success/85',
        trigger: 'bg-success hover:bg-success/85',
      },
      warning: {
        button: 'bg-warning hover:bg-warning/85',
        trigger: 'bg-warning hover:bg-warning/85',
      },
      danger: {
        button: 'bg-danger hover:bg-danger/85',
        trigger: 'bg-danger hover:bg-danger/85',
      },
    },
    size: {
      sm: {
        button: 'h-7 px-2 text-xs',
        trigger: 'h-7 px-1.5 text-xs',
        buttonIcon: 'size-3',
      },
      md: {
        button: 'h-10 px-3 text-base sm:h-9 sm:text-sm',
        trigger: 'h-10 px-2 text-base sm:h-9 sm:text-sm',
      },
    },
  },
  defaultVariants: {
    color: 'primary',
    size: 'md',
  },
})
