import { tv } from 'tailwind-variants'

export const style = tv({
  slots: {
    root: [
      'relative inline-flex items-center',
      'whitespace-nowrap cursor-pointer',
      'space-x-2'
    ],
    input: [
      'box-content bg-input rounded-full border-4 border-input peer-checked:border-primary',
      'peer-checked:after:translate-x-[1.25rem] peer-checked:after:border-white peer-checked:bg-primary',
      'after:content-[\'\'] after:absolute after:size-4 after:bg-white after:rounded-full',
      'after:transition-transform after:duration-300 after:ease-spring',
    ],
    label: [
      'inline-block empty:hidden text-sm transition-colors',
      'text-muted-foreground hover:text-foreground',
    ]
  },
  variants: {
    size: {
      sm: {
        input: 'w-7 h-3 after:size-3 peer-checked:after:translate-x-[1rem]',
        label: 'text-xs',
      },
      md: {
        input: 'w-9 h-4',
      },
    },
  },
})
