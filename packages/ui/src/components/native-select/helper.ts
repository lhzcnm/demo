export type XNativeSelectValue = string | number | undefined

export interface XNativeSelectProps {
  options: any[]
  valueKey: string
  labelKey: string
  disabled?: boolean
  placeholder?: string
  default?: XNativeSelectValue
  class?: string
  iconClass?: string
}

export interface XNativeSelectEmits {
  (e: 'change', value: XNativeSelectValue): void
}
