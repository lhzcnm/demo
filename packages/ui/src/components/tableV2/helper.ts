import type { ClassNameValue } from "tailwind-merge"
import type { VNode } from "vue"

export type RowKey = string | number
export type IdentitierType = boolean | string | number

export interface XTableV2Column<T = any> {
  key: keyof T & string,
  title: string,
  width?: number | string,
  minWidth?: number | string,
  align?: "left" | "center" | "right",
  fixed?: "left" | "right",
  isGroup?: boolean,
  isDrag?: boolean,
  flex?: boolean,
  render?: (value: any, row: T, index: number) => VNode | null,
  headerRender?: (col: XTableV2Column<T>, data: any[]) => VNode | null,
  headerActionRender?: (col: XTableV2Column<T>) => VNode | null,
  identifier?: Record<string, IdentitierType>,
}

export interface XTableV2Props<T = any> {
  columns: XTableV2Column<T>[],
  data: T[],
  overscan?: number,
  showHeader?: boolean,
  striped?: boolean,
  bordered?: boolean,
  itemHeight?: number,
  autoScroll?: boolean,
  selection?: boolean,
  selectKey?: keyof T & string,
  uiRoot?: ClassNameValue,
  uiHeader?: ClassNameValue,
  uiColumn?: ClassNameValue,
}

export interface XTableV2Emits {
  scroll: [e: Event],
  selected: [e: RowKey[]],
}

export interface XTableV2Expose {
  refresh: () => void,
  scrollToTop: () => void,
  initCheckedRows: () => void,
}

export type XTableV2Slots<T> = {
  [Key in keyof T as `cell-${string & Key}`]?: (props: { row: T, col: any }) => VNode | string
}
