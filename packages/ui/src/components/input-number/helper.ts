import type { ClassNameValue } from "tailwind-merge"

export const XInputNumberSize = ['sm', 'md', 'lg'] as const
export type XInputNumberSize = typeof XInputNumberSize[number]

export interface XInputNumberProps extends XInputNumberUi {
  id?: string
  name?: string
  size?: XInputNumberSize
  precision?: number
  min?: number
  max?: number
  step?: number
}

export interface XInputNumberUi {
  uiRoot?: ClassNameValue
  uiInput?: ClassNameValue
  uiButton?: ClassNameValue
}

export interface XInputNumberEmits {
  change: [],
  focus: [e: Event],
  blur: [e: Event],
}
