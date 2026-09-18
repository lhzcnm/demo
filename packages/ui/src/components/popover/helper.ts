import type { ClassNameValue } from 'tailwind-merge'
import type { Placement } from '@floating-ui/vue'
import type { VNode } from 'vue'

export const TRANSFORM_ORIGINS = {
  'top': 'bottom center',
  'top-start': 'bottom left',
  'top-end': 'bottom right',

  'right': 'left center',
  'right-start': 'left top',
  'right-end': 'left bottom',

  'bottom': 'top center',
  'bottom-start': 'top left',
  'bottom-end': 'top right',

  'left': 'right center',
  'left-start': 'right top',
  'left-end': 'right bottom',
}

export const XPOPOVER_TRIGGERS = ['click', 'hover', 'focus'] as const
export type XPopoverTrigger = (typeof XPOPOVER_TRIGGERS)[number]

export interface XPopoverProps extends XPopoverUi {
  teleport?: string | false | HTMLElement
  trigger?: XPopoverTrigger
  placement?: Placement
  closeOnClickOutside?: boolean
  closeOnEsc?: boolean
  offset?: number
  hoverDelay?: number
  openDelay?: number
  animation?: boolean
  syncWidth?: boolean | 'force'
  lazyRender?: boolean
  renderCtl?: boolean
  closeOnMouseLeave?: boolean
}

export interface XPopoverEmits {
  (e: 'closed'): void
  (e: 'mouseleave'): void
}

export interface XPopoverSlots {
  trigger: () => VNode[]
  default: () => VNode[]
}

export interface XPopoverUi {
  uiRoot?: ClassNameValue
  uiContent?: ClassNameValue
}
