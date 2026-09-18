import type { ClassNameValue } from 'tailwind-merge'
import type { IconifyIcon } from '@iconify/vue'

export const XBTN_VARIANTS = ['solid', 'outline', 'soft', 'ghost'] as const
export type XBtnVariant = (typeof XBTN_VARIANTS)[number]

export const XBTN_COLORS = ['primary', 'success', 'warning', 'danger'] as const
export type XBtnColor = (typeof XBTN_COLORS)[number]

export const XBTN_SIZES = ['sm', 'md'] as const
export type XBtnSize = (typeof XBTN_SIZES)[number]

export const XBTN_NATIVE_TYPES = ['button', 'submit', 'reset'] as const
export type XBtnNativeType = (typeof XBTN_NATIVE_TYPES)[number]

export interface XBtnProps {
  class?: ClassNameValue
  type?: XBtnNativeType
  variant?: XBtnVariant
  color?: XBtnColor
  size?: XBtnSize
  label?: string
  icon?: string | IconifyIcon
  loading?: boolean
  disabled?: boolean
}
