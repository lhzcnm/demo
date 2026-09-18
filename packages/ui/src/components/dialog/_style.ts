import { tv } from 'tailwind-variants'

export const style = tv({
  slots: {
    mask: [
      'fixed top-0 bottom-0 left-0 right-0 z-40',
      'flex flex-col items-center justify-center overflow-y-auto',
      'bg-black/60 opacity-0 pointer-events-none',
    ],
    root: [
      'relative flex flex-col p-4 sm:p-6 w-[calc(100%-2rem)] sm:max-w-sm',
      'bg-popover dark:border rounded-md will-change-transform',
    ],
    header: 'flex justify-between items-center mb-3',
    title: 'text-xl font-semibold',
    closeBtn: [
      'p-1 rounded text-muted-foreground',
      'hover:bg-muted transition-all duration-200',
    ],
    closeIcon: 'size-5',
    text: 'mb-4 max-h-[75vh] overflow-y-auto',
    body: 'flex-1 overflow-auto'
  },
  variants: {
    isShaking: {
      true: {
        root: 'x-shake-animation',
      },
    },
    visible: {
      true: {
        mask: 'opacity-100 pointer-events-auto',
      },
    },
  },
})
