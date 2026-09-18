import type { ClassNameValue } from "tailwind-merge"

export type XSegmentedValue = string | number

export const XSEGMENTED_COLORS = ['blue', 'teal'] as const
export type XSegmentedColor = (typeof XSEGMENTED_COLORS)[number]

export const XSEGMENTED_SIZES = ['sm', 'md'] as const
export type XSegmentedSize = (typeof XSEGMENTED_SIZES)[number]

export interface XSegmentedOption {
  value: XSegmentedValue
  label: string
  icon?: string
}

export interface XSegmentedProps extends XSegmentedUi {
  options: XSegmentedOption[]
  color?: XSegmentedColor
  size?: XSegmentedSize
}

export interface XSegmentedEmits {
  (e: 'change', value: XSegmentedValue): void
}

export interface XSegmentedUi {
  uiRoot?: ClassNameValue
  uiContainer?: ClassNameValue
  uiIndicator?: ClassNameValue
  uiButton?: ClassNameValue
  uiIcon?: ClassNameValue
}
