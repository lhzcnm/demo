import type { ClassNameValue } from "tailwind-merge"

export type TriggerType = 'click' | 'dblclick'
export type EditorDataType = 'string' | 'number' | 'price' | 'decimal'

interface OutsideTrigger {
  close?: boolean
  save?: boolean
}

interface TrigerEdit {
  trigger?: TriggerType
  dataType?: EditorDataType
  props?: Record<string, any>
  decimalPrecision?: number,
  onSaveEdit?: (row: Record<string, any>, val: any) => void

  outside?: OutsideTrigger
}

export interface EditState {
  rowIndex: number
  key: string
  value: string
  type: EditorDataType
}

export type XColDef<T> = XTableColumn<T>[]
export interface XTableColumn<T = any> {
  key: (keyof T) | (string & {})
  title?: string
  minWidth?: number
  width?: number
  visible?: boolean
  thClassName?: string
  tdClassName?: string
  cellEmpty?: string
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  isColDel?: boolean
  isFilter?: boolean
  isDrag?: boolean
  showNullOrWhitespace?: boolean
  render?: (value: any, row: T, index: number) => any
  headerRender?: (rows: T[]) => any

  // 编辑器配置
  edit?: TrigerEdit
}

export interface XTableProps extends XTableUi {
  data: Record<string, any>[]
  columns: XTableColumn[]
  selection?: boolean
  selectedKey?: string
  rowKey?: string
  loading?: boolean
  emptyText?: string
  class?: ClassNameValue
  selectionWidth?: number
}

export interface XTableUi {
  uiTable?: ClassNameValue
}

export interface XTableEmits {
  (e: 'row-click', row: any, index: number): void
  (e: 'row-dblclick', row: any, index: number): void
  (e: 'select-change', list: any[]): void
  (e: 'column-delete', column: XTableColumn): void
  (e: 'cell-edit', payload: {
    row: any
    key: string | number | symbol
    value: any
  }): void
}

export interface XTableExpose {
  scrollToTop: () => void
  initFilter: () => void
}
