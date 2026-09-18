import { tv } from "tailwind-variants"

export const style = tv({
  slots: {
    content: 'w-64 p-3',
    trigger: [
      'inline-flex items-center justify-between',
      'space-x-2 w-full px-2.5 h-10 sm:h-9',
      'border border-input hover:border-hover',
      'shadow-sm rounded cursor-pointer',
    ],
    control: 'flex justify-between items-center mb-2',
    controlBtn: 'p-1 text-muted-foreground rounded hover:bg-muted',
    dayItem: 'text-center p-1 text-sm rounded',
  },
  variants: {
    isToday: {
      true: {
        dayItem: 'text-primary ring-1 ring-primary',
      }
    },
    isCurrentMonth: {
      true: {
        dayItem: 'cursor-pointer hover:bg-muted',
      },
      false: {
        dayItem: 'text-muted-foreground pointer-events-none',
      }
    },
    isSelected: {
      true: {
        dayItem: 'bg-primary hover:bg-primary/90 text-white',
      }
    },
    isInRange: {
      true: {
        dayItem: 'bg-muted',
      }
    },
    isHoverRange: {
      true: {
        dayItem: 'bg-muted',
      }
    },
  }
})
