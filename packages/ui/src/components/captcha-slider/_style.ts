import { tv } from "tailwind-variants";

export const style = tv({
  slots: {
    root: 'max-w-sm',
    images: 'relative overflow-hidden rounded-lg h-48 border',
    bgImage: 'absolute h-full w-full select-none touch-none',
    templateImage: 'absolute h-full !w-[58px] transition-transform duration-0 select-none touch-none',
    loading: 'h-48 border rounded-lg text-muted-foreground',
    slider: 'relative h-9 px-1 mt-2 bg-black/5 dark:bg-white/5 rounded select-none',
    sliderText: 'absolute top-0 left-0 right-0 bottom-0 text-sm text-center text-zinc-400 leading-8',
    sliderThumb: [
      'absolute flex items-center justify-center h-9 w-[48px]',
      'bg-white dark:bg-zinc-800 rounded border',
      'transition-transform duration-0 cursor-grab'
    ],
    sliderThumbIcon: 'size-7 text-zinc-200 dark:text-zinc-600',
  }
})
