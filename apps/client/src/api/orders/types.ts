import type { ASYNC_ORDER_STATUS, ORDER_STATUS, ORDER_VERIFY } from '@3un/utils'
import type { IList, IPage, R } from '@3un/shared'

export interface OrderApi {
  item(id: number): R<Order>
  list(data: OrderListParams): R<OrderListResponse>
  export(data: OrderExportParams): R<string>

  submit(data: OrderSubmitParams): R<OrderSubmitResult[]>
  submitExport(data: OrderSubmitExportParams): R<string>
  submitOrders(data: SubmitOrderListParams): R<OrderTableView[]>

  verify(id: number, params: VertifyParams): R<void>
  orderPrint(body: OrderPrintParams): R<Blob>

  cacheImei(body: CacheImeiParams): R<string[]>
  deleteCacheImei(params: DeleteImeiPrams): R<void>

  // generateQrcode(params: QrcodeImageParams): R<Blob>
  devices(): R<string>
  salesRegion(): R<string>

  hasProcessing(): R<boolean>

  orderProgress(params: OrderProgressRequest): R<OrderProgressResp>
}

export interface Order {
  id: number
  serviceId: number
  status: ORDER_STATUS
  verify: ORDER_VERIFY
  imei: string
  credits: number
  remark: string
  result: string
  createTime: string
  recommends: OrderRecommend[] | null
}

export interface OrderRecommend {
  packageId: number
  name: string
}

/** Table */
export interface OrderTableView {
  id: number | null
  index: number
  serviceId: number | null
  serviceName: string | null
  status: ORDER_STATUS
  verify: ORDER_VERIFY
  submitedStatus?: ASYNC_ORDER_STATUS
  imei: string
  credits: number
  remark: string
  result: string
  createTime: string
  recommends: OrderRecommend[] | null
  isStorage: boolean
  [key: string]: any
}

export interface CustomSubmitOrder {
  id: number | null,
  serviceId: number,
  status: ORDER_STATUS,
  imei: string,
  result: string,
  fields: FieldValue,
}

export interface FieldValue {
  [key: string]: {
    title: string,
    value: string
  }
}

/** List */
export type OrderListResponse = IList<Order>
export type OrderListParams = IPage & {
  serviceId?: number
  status?: ORDER_STATUS
  imeiList?: string[]
  codeIdList?: string[]
  startTime?: string
  endTime?: string
}
export interface OrderSearchForm {
  serviceId: number
  status: ORDER_STATUS | -1
  imei: string
  startTime: string
  endTime: string
  codeIds?: string
}

/** Export */
export interface OrderExportParams {
  serviceId: number
  status?: ORDER_STATUS
  imeiList?: string[]
  orderIdList?: string[]
  startTime?: string
  endTime?: string
  excelHead?: string[]
  fileName?: string
}
export interface OrderExportForm {
  serviceId: number
  imei: string
  status: ORDER_STATUS | -1
  startTime: string
  endTime: string
}

/** Submit */
export interface OrderSubmitParams {
  serviceId: number
  imeiList: string[]
  isBulk: boolean
  language: string
  remark?: string
}
export interface OrderSubmitForm {
  serviceId: number
  groupId: number
  imeiList: string
  remark: string
  isBulk: boolean
}
export interface OrderSubmitResult {
  status: ORDER_STATUS
  message: string
  imei: string
  codeId: number | null
}
export interface OrderSubmitExportParams {
  orderIdList: number[]
  imeiList?: string[]
  serviceId: number
  excelHead: string[]
  deleteExcelHead: string[]
  fileName?: string
}
export interface SubmitOrderListParams {
  serviceId: number
  codeIdList: number[]
  showAll: boolean
}

/** generate image */
export interface GeneratePictureParms {
  code: string,
  codeStatusId: number,
  imei: string,
  credits: string,
  codeId: string,
  comments: string,
  dataTime: string,
  packageTitle: string,
}

export interface ServiceColumnItem {
  name: string,
  nameEn: string | null,
}

export interface OrderPrintParams {
  result: string[],
  labelWidth: string,
  labelHeight: string,
}

export interface CacheImeiParams {
  imeiList?: string[],
  serviceId: number,
}

export interface DeleteImeiPrams {
  serviceId: number,
  imeiList: string[],
  idList: number[],
}

export interface QrcodeImageParams {
  content: string,
}

export interface VertifyParams {
  isUnlock: boolean
  serviceId: number
}

export interface OrderProgressRequest {
  serviceId: number
}

export interface OrderProgressResp {
  total: number
  waiting: number
  processing: number
  success: number
  failed: number
  reject: number
}
