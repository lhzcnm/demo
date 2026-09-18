export type XDatePickerValue = Date | string | null | undefined
export type XDatePickerRange = XDatePickerValue[]

export interface XDateRangePickerProps extends XDateRangePickerUi {
  labelFormat?: string
  valueFormat?: string
  placeholder?: string
  disabled?: boolean
}
export interface XDateRangePickerEmits {
  (e: 'apply', value: XDatePickerRange): void
}
export interface XDateRangePickerUi {
  uiContent?: string
  uiTrigger?: string
}

export interface XDatePickerProps extends XDatePickerUi {
  labelFormat?: string
  valueFormat?: string
  placeholder?: string
  disabled?: boolean
  visibleTime?: boolean
}
export interface XDatePickerEmits {
  (e: 'apply', value: XDatePickerValue): void
}
export interface XDatePickerUi {
  uiContent?: string
  uiTrigger?: string
}
