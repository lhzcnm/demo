import type { IList, IPage } from '@3un/shared'
import { ORDER_STATUS, ORDER_VERIFY, SUBMIT_METHOD, ORDER_SEARCH_SUBMIT_METHOD } from '@3un/utils'
import { z } from 'zod/v4'

export const zOrder = z.object({
  codeId: z.number().default(0),
  userId: z.number().default(0),
  imeiNo: z.string().default(''),
  packageId: z.number().default(0),
  codeStatusId: z.enum(ORDER_STATUS).default(ORDER_STATUS.WAIT),
  requestedAt: z.string().default(''),
  credits: z.number().default(0),
  comments: z.string().default('').nullable(),
  codeSentToOtherServer: z.number().default(0),
  messageFromServer: z.string().default('').nullable(),
  code: z.string().default(''),
  orderIdFromServer: z.string().default(''),
  downloaded: z.boolean().default(false),
  verify: z.enum(ORDER_VERIFY).default(ORDER_VERIFY.NORMAL),
  ip: z.string().default('unknown'),
  verifyIp: z.string().default('').nullable(),
  showToSupplier: z.boolean().default(false).nullable(),
  supplierId: z.string().default('').nullable(),
  requestUpTime: z.string().default(''),
  updateTime: z.string().default(''),
  isBulk: z.boolean().nullable().default(false),
  submitMethod: z.enum(SUBMIT_METHOD).default(SUBMIT_METHOD.WECHAT),
  // payout: z.number().default(0),
  // mtype: z.string().default(''),
  // phoneLockedOn: z.string().default(''),
  // modelNo: z.string().default(''),
  // checkDuplication: z.boolean().default(false),
  // mep: z.string().default(''),
  // model: z.string().default(''),
  // serialNo: z.string().default(''),
  // serviceId: z.string().default(''),
  // modelId: z.string().default(''),
  // providerId: z.string().default(''),
  // operatorId: z.string().default(''),
  // mobileId: z.string().default(''),
  // prd: z.string().default(''),
  // pin: z.string().default(''),
  // kbh: z.string().default(''),
  // otherId: z.string().default(''),
  // otherValue: z.string().default(''),
  // zte: z.string().default(''),
  // network: z.string().default(''),
  // locks: z.string().default(''),
  // personalRecord: z.string().default(''),
  // countryId: z.string().default(''),
  // archived: z.boolean().default(false),
  // adminArchived: z.boolean().default(false),
  // alternateEmail: z.string().default(''),
})

export type Order = z.infer<typeof zOrder>

// Search
export const zOrderSearchForm = z.object({
  userId: z.number().optional(),
  username: z.string().optional(),
  imeiList: z.string().optional(),
  serviceId: z.number().optional(),
  serverOrderIdEmpty: z.boolean().default(false),
  statusId: z.enum(ORDER_STATUS).optional(),
  verify: z.enum(ORDER_VERIFY).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  submitMethod: z.enum(ORDER_SEARCH_SUBMIT_METHOD).optional(),
})

export type OrderSearchForm = z.infer<typeof zOrderSearchForm>
type OmitImeiList = Omit<OrderSearchForm, 'imeiList'>

// List
export type OrderList = IList<Order>
export interface OrderListParams extends IPage, OmitImeiList {
  imeiList: string[] | undefined
}

// Update
export const zOrderUpdateForm = z.object({
  codeId: z.number().default(0),
  imeiNo: z.string().default(''),
  codeStatusId: z.enum(ORDER_STATUS).default(ORDER_STATUS.WAIT),
  originalStatus: z.enum(ORDER_STATUS).default(ORDER_STATUS.WAIT),
  code: z.string().default(''),
  messageFromServer: z.string().default('').nullable(),
  orderIdFromServer: z.string().default(''),
})

export type OrderUpdateForm = z.infer<typeof zOrderUpdateForm>
export type OrderUpdateParams = {
  codeId: number
  imeiNo?: string
  code?: string
  codeStatusId?: ORDER_STATUS
  originalStatus?: ORDER_STATUS
  messageFromServer?: string | null
  orderIdFromServer?: string
}

// Update Code Status
export interface OrderUpdateStatusParam {
  userId: number
  codeId: number
  codeStatusId: ORDER_STATUS
  originalStatus: ORDER_STATUS
}

// Batch Edit Orders
export interface OrderBatchEditItem {
  imei: string
  code: string | null
  serverOrderId: string | null

  status: ORDER_STATUS
  originalStatus: ORDER_STATUS
  serviceId: number

  codeId?: number
}

// Order Verify
export interface OrderVerifyParam {
  codeId: number
  userId: number
  verify: ORDER_VERIFY
  codeStatusId: ORDER_STATUS
  originalStatus: ORDER_STATUS
  code: string
}

// Order Clean
export interface OrderCleanForm {
  checked: string
  time: string
}
