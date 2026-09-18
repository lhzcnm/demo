import type { ClassNameValue } from 'tailwind-merge'
import type { InjectionKey } from 'vue'

export interface XDrawerContext {
  isDrawer: boolean
}

export const DrawerContext: InjectionKey<XDrawerContext> = Symbol('Drawer')

export const XDRAWER_PLACEMENTS = ['left', 'right', 'top', 'bottom'] as const
export type XDrawerPlacement = (typeof XDRAWER_PLACEMENTS)[number]

export interface XDrawerProps extends XDrawerUi {
  title?: string
  placement?: XDrawerPlacement
  width?: string | number
  height?: string | number
  showClose?: boolean
  maskClosable?: boolean
  closeOnEsc?: boolean
}

export interface XDrawerEmits {
  (e: 'close'): void
}

export interface XDrawerUi {
  uiRoot?: ClassNameValue
  uiMask?: ClassNameValue
}
