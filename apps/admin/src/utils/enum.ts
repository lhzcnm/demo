// oss
export enum OSS_UPLOAD_ENUM {
  PLUGIN_WIN = 43,
  PLUGIN_MAC_ARM = 44,
  PLUGIN_MAC_AMD = 45,

  DESKTOP_WIN = 46,
  DESKTOP_MAC_ARM = 47,
  DESKTOP_MAC_AMD = 48
}

export const OSS_UPLOAD_TYPE_LIST = [
  { value: OSS_UPLOAD_ENUM.PLUGIN_WIN, label: '插件 windows' },
  { value: OSS_UPLOAD_ENUM.PLUGIN_MAC_ARM, label: '插件 mac arm' },
  { value: OSS_UPLOAD_ENUM.PLUGIN_MAC_AMD, label: '插件 mac x86' },
  { value: OSS_UPLOAD_ENUM.DESKTOP_WIN, label: '桌面端 windows' },
  { value: OSS_UPLOAD_ENUM.DESKTOP_MAC_ARM, label: '桌面端 mac arm' },
  { value: OSS_UPLOAD_ENUM.DESKTOP_MAC_AMD, label: '桌面端 mac x86' },
]

// quotation
export enum QUOTATION_ENUM {
  OLD = 'quotation:old',
  NEW = 'quotation:new'
}

export const QUOTATION_ENUM_LIST = [
  { value: QUOTATION_ENUM.OLD, label: '报价单 - 旧机' },
  { value: QUOTATION_ENUM.NEW, label: '报价单 - 新机' },
]

export enum PLAN_TYPE_ENUM {
  GRANDTOTAL = 0,
  SUBSCRIPTION = 1,
  FIXED = 2,
}

export const PLAN_TYPE_LIST = [
  {
    value: PLAN_TYPE_ENUM.GRANDTOTAL,
    label: '充值额度自动升级',
  },
  {
    value: PLAN_TYPE_ENUM.SUBSCRIPTION,
    label: '一次性付费会员',
  },
  {
    value: PLAN_TYPE_ENUM.FIXED,
    label: '固定会员等级',
  },
]
