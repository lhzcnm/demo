import type { ClassNameValue } from "tailwind-merge"

export const XINPUT_TYPES = ['text', 'password', 'email', 'number', 'date', 'time', 'datetime', 'datetime-local', 'month', 'week', 'search', 'tel'] as const
export type XInputType = (typeof XINPUT_TYPES)[number]

export type XInputValue = string | number | null | undefined

export interface XInputProps extends XInputUi {
  type?: XInputType
  id?: string
  name?: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  icon?: string
}

export interface XInputUi {
  uiRoot?: ClassNameValue
}

export interface XInputEmits {
  (e: 'clear'): void
}
