import { tv } from 'tailwind-variants'

export const style = tv({
  slots: {
    root: 'flex py-4 first:pt-0 last:pb-0 border-dashed',
    title: 'text-base font-semibold',
    desc: 'text-sm text-muted-foreground',
    body: 'flex items-center space-x-2',
  },
  variants: {
    variant: {
      vertical: {
        root: 'flex-col space-y-2',
      },
      horizontal: {
        root: 'space-x-1'
      }
    },
    required: {
      true: {
        title: 'before:content-["*"] before:text-danger before:text-sm'
      }
    },
    contentFlex: {
      true: {
        body: 'flex-1'
      }
    }
  }
})
