import { tv } from 'tailwind-variants'

// select ui
export const style = tv({
  slots: {
    root: 'flex flex-col',
    trigger: [
      'group relative flex items-center justify-between space-x-2',
      'w-full text-muted-foreground',
      'border hover:border-hover rounded shadow-sm transition-colors',
    ],
    triggerText: 'truncate',
    triggerIcon: 'flex-shrink-0 py-2 text-base transition-opacity delay-200',
    clearIcon: [
      'absolute right-3 py-2 hover:text-primary',
      'opacity-0 transition-opacity delay-200 pointer-events-none'
    ],

    input: 'relative flex items-center space-x-2 px-3 py-2.5 border-b',
    inputInner: 'w-full text-sm bg-transparent border-none outline-none focus:outline-none',
    icon: 'size-4 text-muted-foreground',

    content: 'flex flex-col p-1.5 max-h-96 overflow-y-auto',
    empty: [
      'flex items-center justify-center',
      'h-10 text-sm text-muted-foreground'
    ],
  },
  variants: {
    showClearIcon: {
      true: {
        triggerIcon: 'group-hover:opacity-0',
        clearIcon: 'group-hover:opacity-100 group-hover:pointer-events-auto'
      }
    },
    selected: {
      true: {
        trigger: 'text-foreground',
      }
    },
    disabled: {
      true: {
        trigger: 'bg-muted text-muted-foreground hover:border-input shadow-none',
      }
    },
    size: {
      sm: {
        trigger: 'h-7 px-2 text-xs'
      },
      md: {
        trigger: 'h-10 sm:h-9 px-3 text-sm'
      },
    },
  }
})

// select group ui
export const groupStyle = tv({
  slots: {
    root: 'flex flex-col space-y-1 mt-3 first:mt-0',
    title: 'mx-2 text-sm font-semibold text-muted-foreground',
  }
})

// select item ui
export const itemStyle = tv({
  slots: {
    root: [
      'flex items-center px-2 py-1.5 text-sm',
      'hover:bg-muted hover:rounded',
    ],
    icon: 'inline-block size-4 mr-2',
    label: '',
  }
})
