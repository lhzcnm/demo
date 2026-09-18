import type { InjectionKey, Ref, VNode } from 'vue'
import type { Placement } from '@floating-ui/vue'
import type { ClassNameValue } from 'tailwind-merge'

export type XSelectValue = string | number | boolean | null | undefined

// Provider
export interface XSelectContext {
  model: Ref<XSelectValue>
  options: Ref<Option[]>
  itemClick: (value: XSelectValue) => void
}
export interface Option {
  value: string | number | boolean
  label: string
}

export const XSELECT_CONTEXT =
  Symbol('select-context') as
    InjectionKey<XSelectContext>

// select
export interface XSelectProps extends XSelectUi {
  defaultValue?: null | undefined
  filterable?: boolean
  placement?: Placement
  multiple?: boolean
  placeholder?: string
  inputPlaceholder?: string
  lazyRender?: boolean
  clearable?: boolean
  disabled?: boolean
  size?: 'sm' | 'md'
  closeOnMouseLeave?: boolean
}
export interface XSelectEmits {
  (e: 'selected', value: any): void
  (e: 'clear'): void
  (e: 'mouseleave', value: boolean): void
  (e: 'click'): void
}
export interface XSelectUi {
  uiRoot?: ClassNameValue
  uiTrigger?: ClassNameValue
  uiContent?: ClassNameValue
  uiInput?: ClassNameValue
  uiEmpty?: ClassNameValue
}

// select group
export interface XSelectGroupProps extends XSelectGroupUi {
  title: string
}
export interface XSelectGroupUi {
  uiRoot?: ClassNameValue
  uiTitle?: ClassNameValue
}

// select item
export interface XSelectItemProps extends XSelectItemUi {
  value: string | number | boolean
  label?: string
  className?: string
}
export interface XSelectItemSlots {
  default: () => VNode[]
}
export interface XSelectItemUi {
  uiRoot?: ClassNameValue
  uiIcon?: ClassNameValue
  uiLabel?: ClassNameValue
}
