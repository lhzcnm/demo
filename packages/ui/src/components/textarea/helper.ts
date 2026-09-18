export type XTextareaValue = string | number | null | undefined

export interface XTextareaProps {
  class?: any
  id?: string
  name?: string
  rows?: number | string
  cols?: number | string
  autoRows?: boolean | [number, number]
  placeholder?: string
  disabled?: boolean
}
