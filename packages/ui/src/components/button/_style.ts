import { tv } from 'tailwind-variants'

export const style = tv({
  base: [
    'inline-flex items-center justify-center space-x-1.5',
    'whitespace-nowrap rounded transition-colors',
  ],
  variants: {
    color: {
      primary: 'bg-primary hover:bg-primary/85',
      success: 'bg-success hover:bg-success/85',
      warning: 'bg-warning hover:bg-warning/85',
      danger: 'bg-danger hover:bg-danger/85',
    },
    variant: {
      solid: 'text-white shadow-sm',
      outline: 'ring-1 ring-inset',
      ghost: 'bg-transparent',
      soft: '',
    },
    disabled: {
      true: 'shadow-none pointer-events-none',
    },
    size: {
      sm: 'h-7 px-2 text-xs',
      md: 'h-10 px-3 text-base sm:h-9 sm:text-sm',
    },
  },
  compoundVariants: [
    // primary
    {
      variant: 'outline',
      color: 'primary',
      class: [
        'ring-primary text-primary bg-transparent dark:bg-primary/5',
        'hover:bg-primary/10 dark:hover:bg-primary/30',
      ],
    },
    {
      variant: 'soft',
      color: 'primary',
      class: [
        'bg-primary/10 text-primary hover:bg-primary/20',
        'dark:text-primary dark:bg-primary/20 dark:hover:bg-primary/30',
      ],
    },
    {
      variant: 'ghost',
      color: 'primary',
      class: 'text-primary hover:bg-primary/20',
    },

    // success
    {
      variant: 'outline',
      color: 'success',
      class: [
        'ring-success text-success bg-transparent dark:bg-success/5',
        'hover:bg-success/10 dark:hover:bg-success/30',
      ],
    },
    {
      variant: 'soft',
      color: 'success',
      class: [
        'bg-success/10 text-success hover:bg-success/20',
        'dark:bg-success/20 dark:hover:bg-success/30',
      ],
    },
    {
      variant: 'ghost',
      color: 'success',
      class: 'text-success hover:bg-success/20',
    },

    // warning
    {
      variant: 'outline',
      color: 'warning',
      class: [
        'ring-warning text-warning bg-transparent dark:bg-warning/5',
        'hover:bg-warning/10 dark:hover:bg-warning/30',
      ],
    },
    {
      variant: 'soft',
      color: 'warning',
      class: [
        'bg-warning/10 text-warning hover:bg-warning/20',
        'dark:bg-warning/20 dark:hover:bg-warning/30',
      ],
    },
    {
      variant: 'ghost',
      color: 'warning',
      class: 'text-warning hover:bg-warning/20',
    },

    // danger
    {
      variant: 'outline',
      color: 'danger',
      class: [
        'ring-danger text-danger bg-transparent dark:bg-danger/5',
        'hover:bg-danger/10 dark:hover:bg-danger/30',
      ],
    },
    {
      variant: 'soft',
      color: 'danger',
      class: [
        'bg-danger/10 text-danger hover:bg-danger/20',
        'dark:bg-danger/20 dark:hover:bg-danger/30',
      ],
    },
    {
      variant: 'ghost',
      color: 'danger',
      class: 'text-danger hover:bg-danger/20',
    },

    // disabled
    {
      variant: 'solid',
      color: 'primary',
      disabled: true,
      class: 'bg-primary/50',
    },
    {
      variant: 'solid',
      color: 'success',
      disabled: true,
      class: 'bg-success/50',
    },
    {
      variant: 'solid',
      color: 'warning',
      disabled: true,
      class: 'bg-warning/50',
    },
    {
      variant: 'solid',
      color: 'danger',
      disabled: true,
      class: 'bg-danger/50',
    },
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'primary',
    size: 'md',
  },
})
