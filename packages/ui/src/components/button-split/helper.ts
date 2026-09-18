import type { XBtnColor, XBtnSize } from '../button/helper'
import type { IconifyIcon } from '@iconify/vue'
import type { XPopoverProps } from '../popover'
import type { ClassNameValue } from 'tailwind-merge'

export interface XBtnSplitProps extends XBtnSplitUI {
  options: XBtnSplitOptions
  label?: string
  color?: XBtnColor
  size?: XBtnSize
  teleport?: XPopoverProps['teleport']
  icon?: string | IconifyIcon
  openClick?: boolean
}

export interface XBtnSplitEmits {
  (e: 'click'): void
}

export interface XBtnSplitOption {
  icon?: string | IconifyIcon
  label?: string
  command?: () => void
}

export type XBtnSplitOptions = (XBtnSplitOption | undefined)[]

export interface XBtnSplitUI {
  uiTrigger?: ClassNameValue,
}
