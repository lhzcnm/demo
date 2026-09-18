import { tv } from "tailwind-variants"

export const style = tv({
  base: 'px-2 py-1 text-center rounded',
  variants: {
    color: {
      primary: 'bg-primary/15 text-primary',
      success: 'bg-success/15 text-success',
      warning: 'bg-warning/15 text-warning',
      danger: 'bg-danger/15 text-danger',
      info: 'bg-zinc-700/15 text-zinc-500',
    },
    size: {
      sm: 'px-1.5 py-0.5 text-[0.7rem]',
      md: 'px-2 py-1 text-xs',
    },
    solid: {
      true: 'text-white',
    },
  },
  compoundVariants: [
    {
      solid: true,
      color: 'primary',
      className: 'bg-primary',
    },
    {
      solid: true,
      color: 'success',
      className: 'bg-success',
    },
    {
      solid: true,
      color: 'warning',
      className: 'bg-warning',
    },
    {
      solid: true,
      color: 'danger',
      className: 'bg-danger',
    },
    {
      solid: true,
      color: 'info',
      className: 'bg-zinc-700',
    },
  ],
  defaultVariants: {
    color: 'primary',
    size: 'md',
    solid: false,
  },
})
