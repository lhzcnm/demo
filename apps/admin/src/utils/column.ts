import type { XColDef } from "@3un/ui"

export enum ColumnEnum {
  // activity
  Activity,
  ActivityRecharge,

  // Credit
  Credit,

  // Docx
  Docx,

  // intercept
  Intercept,

  // locale
  Locale,
  
  // logs
  Logs,

  // monitor
  Monitor,

  // order
  Order,
  OrderVerify,

  // oss
  Oss,

  // recharge
  Recharge,
  RechargePackage,

  // service
  ServiceField,
  ServiceGroup,
  ServiceItem,
  ServiceUnlock,

  // upstream
  UpstreamApi,

  // user
  User,
  UserLevel,
  UserPaid,

  // voucher
  Voucher,

  // wechat
  WechatMessage,
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
  [ColumnEnum.Activity]: { key: 'activity_column' },
  [ColumnEnum.ActivityRecharge]: { key: 'activity_recharge_column' },
  [ColumnEnum.Credit]: { key: 'credit_column' },
  [ColumnEnum.Docx]: { key: 'docx_column' },
  [ColumnEnum.Intercept]: { key: 'intercept_column' },
  [ColumnEnum.Locale]: { key: 'locale_column' },
  [ColumnEnum.Logs]: { key: 'logs_column' },
  [ColumnEnum.Monitor]: { key: 'monitor_column' },
  [ColumnEnum.Order]: { key: 'order_column' },
  [ColumnEnum.OrderVerify]: { key: 'order_verify_column' },
  [ColumnEnum.Oss]: { key: 'oss_column' },
  [ColumnEnum.Recharge]: { key: 'recharge_column' },
  [ColumnEnum.RechargePackage]: { key: 'recharge_package_column' },
  [ColumnEnum.ServiceField]: { key: 'service_field_column' },
  [ColumnEnum.ServiceGroup]: { key: 'service_group_column' },
  [ColumnEnum.ServiceItem]: { key: 'service_item_column' },
  [ColumnEnum.ServiceUnlock]: { key: 'service_unlock_column' },
  [ColumnEnum.UpstreamApi]: { key: 'upstream_api_column' },
  [ColumnEnum.User]: { key: 'user_column' },
  [ColumnEnum.UserLevel]: { key: 'user_level_column' },
  [ColumnEnum.UserPaid]: { key: 'user_paid_column' },
  [ColumnEnum.Voucher]: { key: 'voucher_column' },
  [ColumnEnum.WechatMessage]: { key: 'wechat_message_column' },
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
