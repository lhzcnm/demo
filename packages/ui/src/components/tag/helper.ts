import type { ClassNameValue } from "tailwind-merge"

export const XTAG_COLORS = ['primary', 'success', 'warning', 'danger', 'info'] as const
export type XTagColor = (typeof XTAG_COLORS)[number]

export const XTAG_SIZES = ['sm', 'md'] as const
export type XTagSize = (typeof XTAG_SIZES)[number]

export interface XTagProps {
  class?: ClassNameValue
  color?: XTagColor
  size?: XTagSize
  label?: string
  solid?: boolean
}
