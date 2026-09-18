import { tv } from "tailwind-variants"

export const simpleStyle = tv({
  slots: {
    root: 'flex items-center',
    control: [
      'inline-flex items-center justify-center',
      'bg-primary hover:bg-primary/90 text-white rounded shadow-sm',
      'disabled:opacity-50 disabled:pointer-events-none',
    ],
    pager: [
      'flex items-center justify-center space-x-1.5',
      'text-center leading-7 bg-muted rounded',
    ]
  },
  variants: {
    size: {
      sm: {
        root: 'space-x-1',
        control: 'size-7 p-1',
        pager: 'min-w-16 h-7 px-1.5 text-sm',
      },
      md: {
        root: 'space-x-2',
        control: 'size-9 p-1',
        pager: 'min-w-20 h-9 px-2',
      },
    }
  },
  defaultVariants: {
    size: 'md',
  }
})

export const pageStyle = tv({
  slots: {
    root: 'flex items-center space-x-2 text-center leading-7',
    item: 'min-w-9 h-9 px-2 bg-muted hover:bg-accent/20 rounded transition-colors duration-200',
  },
  variants: {
    isCurPage: {
      true: {
        item: 'bg-primary hover:bg-primary/90 text-white',
      },
    }
  }
})
