import { tv } from "tailwind-variants"

export const style = tv({
  slots: {
    root: 'w-64 p-4 text-muted-foreground select-none',
    image: 'inline-block size-full',
    title: 'text-center text-lg mt-3',
  }
})
