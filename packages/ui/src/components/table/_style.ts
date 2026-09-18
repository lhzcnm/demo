import { tv } from "tailwind-variants"

export const style = tv({
  slots: {
    base: 'bg-[var(--bg)] overflow-auto',
    table: 'w-full table-fixed border-separate border-spacing-0 text-sm',
    th: 'py-3 px-2 align-bottom border-b group',
    td: 'p-2 border-b break-all',
    selectionTh: 'align-middle text-center p-0 w-full h-full',
    selectionTd: 'p-0 w-full h-full align-middle text-center'
  },
  variants: {
    align: {
      left: {
        th: 'text-left',
        td: 'text-left',
      },
      center: {
        th: 'text-center',
        td: 'text-center',
      },
      right: {
        th: 'text-right',
        td: 'text-right',
      },
    },
    fixed: {
      true: {
        th: 'sticky bg-[var(--bg)] border-l',
        td: 'sticky bg-[var(--bg)] border-l',
      },
    },
    fixedSide: {
      left: {
        th: 'left-0',
        td: 'left-0',
      },
      right: {
        th: 'right-0',
        td: 'right-0',
      },
    },
    hidden: {
      true: {
        th: 'hidden',
        td: 'hidden',
      }
    },
    isEmpty: {
      true: {
        table: 'h-96',
      },
    },
  }
})
