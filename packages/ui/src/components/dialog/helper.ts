import type { ClassNameValue } from 'tailwind-merge'

export interface XDialogProps extends XDialogUi {
  text?: string
  title?: string
  closeBtn?: boolean
  maskClosable?: boolean
  closeOnEsc?: boolean
  draggable?: boolean
  teleport?: string
  scrollToTopOnClose?: boolean
}

export interface XDialogEmits {
  (e: 'close'): void
}

export interface XDialogExpose {
  el: HTMLElement | null,
}

export interface XDialogUi {
  uiMask?: ClassNameValue
  uiRoot?: ClassNameValue
  uiHeader?: ClassNameValue
  uiTitle?: ClassNameValue
  uiText?: ClassNameValue
}

