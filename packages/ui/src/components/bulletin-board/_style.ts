import { tv } from "tailwind-variants"

export const style = tv({
  slots: {
    base: [
      'relative w-full p-2 overflow-hidden',
      'border bg-[var(--bg)] rounded-md',
    ],
    icon: [
      'absolute top-0 left-0 z-10',
      'flex items-center justify-center h-full w-12 rounded-lg',
      'bg-gradient-to-r from-[var(--bg)] from-80% to-transparent',
    ],
    iconInner: 'align-middle size-5',
    text: 'inline-flex space-x-3 pl-[100%] whitespace-nowrap animate-bulletin-scroll',
  }
})
