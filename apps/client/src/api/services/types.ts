import type { DOMESTIC_IMEI_TYPE, IMEI_TYPE, ServiceFieldType } from '@3un/utils'
import type { R } from '@3un/shared'

export interface ServiceApi {
  list: (params?: ServiceListParams) => R<ServiceDetail[]>
  item: (id: number) => R<Service>
  header: (id: number) => R<ServiceHeader[]>
  setThread: (threadNumber?: number) => R<any>
  getThread: () => R<any>
  favorite: (serviceId?: number) => R<number[]>
  getTemplate: (serviceId: number) => R<string>
  getQuoteImage: () => R<any>
  importFile: (params: FormData) => R<fileDataType>
  stopSubmit: (id: number) => R<any>
}

export interface fileDataType{
  success: boolean
  collected: string[]
}

export interface ServiceDetail {
  id: number
  title: string
  children: Service[]
}

export interface Service {
  id: number
  parentId: number
  title: string
  price: number
  storePrice: string
  taken: string
  imeiType: IMEI_TYPE
  domesticSerialType: DOMESTIC_IMEI_TYPE
  mustRead: string | null
  isNew: boolean
  isHot: boolean
  isUnlock: boolean
  verify: boolean
}
export interface ServiceView {
  id: number
  idHighlight?: string | number
  parentId: number
  title: string
  price: number
  taken: string
  imeiType: IMEI_TYPE
  mustRead: string | null
  isNew: boolean
  isHot: boolean
  isUnlock: boolean
}

export interface ServiceHeader {
  serviceId?: number
  name: string
  nameEn: string
  width?: number
  sortNum?: number
  renderType?: string | null
  itemKey?: string | null
  type?: ServiceFieldType
}

export interface ServiceCols {
  key: string,
  title: string,
  width?: number,
  minWidth?: number,
  isDynamic: boolean,
}

export interface ServiceListParams {
  isUnlock?: boolean
  isDeviceShow?: boolean
  isHide?: boolean
}

export interface FieldMap {
  cn: string,
  en: string | null,
}
