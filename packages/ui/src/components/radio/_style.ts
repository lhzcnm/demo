import { tv } from 'tailwind-variants'

export const style = tv({
  slots: {
    root: 'inline-flex items-center space-x-2 cursor-pointer',
    input: [
      'appearance-none relative size-4 rounded-full border-2',
      'checked:border-primary checked:bg-primary',
      'hover:border-primary/80 focus:outline-none',
      'focus-visible:ring-2 focus-visible:ring-primary/30',
      'transition-colors duration-200',

      'after:absolute after:inset-0 after:m-auto after:block',
      'after:size-1.5 after:rounded-full after:bg-white after:opacity-0',
      'checked:after:opacity-100',
    ],
    label: 'text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
  },
})
