export const XPGN_LAYOUTS = ['prev', 'pager', 'next', 'sizes', 'jumper', 'total'] as const
export type XPgnLayout = (typeof XPGN_LAYOUTS)[number]

export const XPGN_CONTROL_TYPES = ['next', 'prev'] as const
export type XPgnControlType = (typeof XPGN_CONTROL_TYPES)[number]

// Pagination
export interface XPgnProps {
  total: number
  pagerCount?: number
  fixWidth?: boolean
  sizes?: number[]
  layouts?: XPgnLayout[]
  hideOnSinglePage?: boolean
}

// SimplePagination
export interface XSimplePgnProps {
  hideOnSinglePage?: boolean
  size?: 'sm' | 'md'
  limit?: number
  total: number
}

// Control
export interface XPageControlProps {
  type: XPgnControlType
  disabled?: boolean
}

// Pager
export interface XPagerProps {
  pages: number[]
  current: number
  lastPage: number
  isFirstPage: boolean
  isLastPage: boolean
  showAfterMore: boolean
  showBeforeMore: boolean
}
export interface XPagerEmits {
  (e: 'more', mode: XPgnControlType): void
}

// PageSizes
export interface XPageLimitProps {
  modelValue: number
  sizes: number[]
}

// PageJumper
export interface XPageJumperProps {
  modelValue: number
}
