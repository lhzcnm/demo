import { tv } from "tailwind-variants"

export const style = tv({
  slots: {
    base: [
      "x-vtable w-full h-full flex flex-col bg-background rounded min-w-max"
    ],
    header: [
      "px-3 py-2 text-base font-medium text-font tracking-wide whitespace-nowrap border-r last:border-r-0 border-b",
      "flex justify-between items-center",
    ],
    column: [
      "px-3 py-2"
    ]
  },
  variants: {
    bordered: {
      true: {
        base: "border border-border"
      }
    },
    isGroup: {
      true: {
        header: "group"
      }
    }
  }
})
