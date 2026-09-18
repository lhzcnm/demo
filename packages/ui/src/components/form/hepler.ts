import type { InjectionKey, Ref } from 'vue'

export type XFormErrors = Ref<Map<string, string>>
export const XFormContext: InjectionKey<XFormErrors> = Symbol('XFormContext')

export interface XFormProps {
  model ?: any
  schema?: any
}

export interface XFormItemProps {
  label : string
  field?: string
}
