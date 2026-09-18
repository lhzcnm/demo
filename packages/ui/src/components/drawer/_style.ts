import { tv } from 'tailwind-variants'

export const style = tv({
  slots: {
    root: [
      'fixed  flex flex-col bg-popover dark:border shadow-lg',
      'transition-transform duration-300 will-change-transform',
    ],
    mask: [
      'fixed top-0 left-0 right-0 bottom-0 z-40',
      'bg-black/60 opacity-0 pointer-events-none',
      'transition-opacity duration-300',
    ],
    header: 'flex items-center justify-between p-4 border-b',
    title: 'text-xl font-semibold',
    closeBtn: [
      'p-1 rounded text-muted-foreground',
      'hover:bg-muted transition-all duration-200',
    ],
    body: 'flex-1 overflow-y-auto p-4',
  },
  variants: {
    placement: {
      left: {
        root: 'left-0 top-0 h-full',
      },
      right: {
        root: 'right-0 top-0 h-full',
      },
      top: {
        root: 'top-0 left-0 w-full',
      },
      bottom: {
        root: 'bottom-0 left-0 w-full',
      },
    },
    visible: {
      true: {
        mask: 'opacity-100 pointer-events-auto',
      },
    },
  },
  defaultVariants: {
    placement: 'right',
  },
})
