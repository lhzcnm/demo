import type { XColDef } from "@3un/ui"

export enum ColumnEnum {
  // order
  Order,

  // credit
  Credit,
}

interface ColumnMapItem {
  key: string
}

interface StoragedItem {
  key: string
  width: number
}

type ColumnMap = Record<ColumnEnum, ColumnMapItem>

const columnMap: ColumnMap = {
  [ColumnEnum.Credit]: { key: 'credit_column' },
  [ColumnEnum.Order]: { key: 'order_column' },
}

const baseKey = "storaged_column_"

export function storageColumn(
  type: ColumnEnum,
  columnKey: string,
  width: number
) {
  const dynamicKey = columnMap[type].key
  const finalKey = `${baseKey}${dynamicKey}`

  const storaged = localStorage.getItem(finalKey)

  let json: StoragedItem[] = []
  if (storaged) {
    try {
      json = JSON.parse(storaged) as StoragedItem[]
    } catch {
      json = []
    }
  }

  const columnOptionIndex = json?.findIndex(x => x.key === columnKey)

  if (columnOptionIndex !== -1) {
    json[columnOptionIndex] = {
      key: columnKey,
      width: width
    }
  } else {
    json.push({
      key: columnKey,
      width: width
    })
  }

  localStorage.setItem(finalKey, JSON.stringify(json))
}

export function initColumns<T>(
  columns: XColDef<T>,
  type: ColumnEnum,
) {
  const dynamicKey = columnMap[type].key
  const finalKey = `${baseKey}${dynamicKey}`
  const storaged = localStorage.getItem(finalKey)
  
  if (!storaged) {
    return columns
  }

  let json: StoragedItem[] = []
  try {
    json = JSON.parse(storaged)
  } catch {
    json = []
  }

  if (json.length === 0) {
    return columns
  }

  let initedColumns: XColDef<T> = []

  for (const item of columns) {
    let width = item.width
    const storagedColumn = json.find(x => x.key === item.key)

    if (storagedColumn) {
      width = storagedColumn.width
    }

    initedColumns.push({
      ...item,
      width: width
    })
  }

  return initedColumns
}
