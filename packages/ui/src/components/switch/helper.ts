export interface XSwitchProps {
  id?: string
  name?: string
  label?: string
  activeValue?: any
  inactiveValue?: any
  leftLabel?: string
  size?: 'sm' | 'md'
}

export interface XSwitchEmits {
  (e: 'change', value: boolean): void
}
