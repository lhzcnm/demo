import type { ClassNameValue } from "tailwind-merge";

export interface FormFieldProps {
  label: string,
  desc?: string,
  required?: boolean,
  variant?: 'vertical' | 'horizontal',
  uiRoot?: ClassNameValue,
  contentFlex?: boolean
}
