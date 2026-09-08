<script setup lang="ts">
import OrderProgress from '../components/OrderProgress.vue'
import ImportPlane from '../components/ImportPlane.vue'
import TableColumnDialog from '../components/TableColumnDialog.vue'
import { Icon } from '@iconify/vue'

import { toast } from 'vue-sonner'
import { useClipboard } from '@vueuse/core'
import {
  isNumeric,
  XTableV2,
  type XTableV2Expose,
  type RowKey,
  type XBtnSplitOptions,
  type XTableExpose,
  type XTableV2Column,
} from '@3un/ui'
import {
  ASYNC_ORDER_STATUS,
  debounce,
  downloadURL,
  ORDER_STATUS,
  ORDER_VERIFY,
  ServiceFieldType,
  ua,
  xconfirm
} from '@3un/utils'

import { SUBMIT_STORE } from '../utils/index.ts'
import { serviceApi, type FieldMap, type Service, type ServiceCols } from '@/api/services'
import { orderApi, type DeleteImeiPrams, type Order, type OrderProgressResp, type OrderSubmitResult, type OrderTableView, type ServiceColumnItem, type SubmitOrderListParams } from '@/api/orders'
import router from '@/router'
import { getSubmitImei, normalizeFilterValue } from '@/utils/common'
import { processedServiceFields } from '../utils/serviceFieldUtils.ts'
import type { DeleteDataItem } from '../utils/types.ts'

/** 注入提交状态 store */
const store = inject(SUBMIT_STORE)!
store.onClickHeaderDelete = handleDeleteHeader

/** 注入父组件（OldSubmit）的收藏列表刷新方法，用于收藏变更后实时同步侧边栏 */
const reloadFavorites = inject<() => Promise<void>>('reloadFavorites')

/** 国际化相关 */
const { t, locale } = useI18n()

/** 各类 store */
const serviceStore = useServiceStore()
const uStore = useUserStore()
const { connect, close } = useWsStore()
const iStore = useSystemStore()
const localStore = useLocalStore()

/** 剪贴板（legacy 兼容非 HTTPS 环境） */
const { copy } = useClipboard({ legacy: true })

/** 路由 */
const route = useRoute()

/** 表格引用 */
const orderTableRef = ref<XTableV2Expose | null>(null)
const tableRef = ref<XTableExpose | null>(null)

/** UI 状态 */
const disabled = ref(false)
const showAll = ref(false)
const submited = ref<boolean>(false)
const loading = ref(false)
const submitLoading = ref(false)
const reseted = ref<boolean>(false)
const exportLoading = ref(false)

/** 数据状态 */
const selService = ref<Service>()

/** 收藏服务 ID 列表 */
const favoriteIds = ref<number[]>([])

/**
 * 加载收藏列表
 */
async function loadFavorites() {
  try {
    const res = await serviceApi.favorite(undefined)
    favoriteIds.value = Array.isArray(res.data) ? res.data : []
  } catch {
    // ignore
  }
}

/**
 * 切换收藏状态
 * @param serviceId - 服务 ID
 */
async function toggleFavorite(serviceId: number) {
  // const wasFavorited = favoriteIds.value.includes(serviceId)
  try {
    const res = await serviceApi.favorite(serviceId)
    favoriteIds.value = Array.isArray(res.data) ? res.data : []
    // 通知父组件（OldSubmit）刷新收藏列表，使侧边栏实时同步
    await reloadFavorites?.()
  } catch {
    // ignore
  }
}
const serviceColumns = ref<ServiceColumnItem[]>([])
const imeis = ref<string[]>([])
const comments = ref<string>('')
const threads = ref(5)
const pushMsg = ref(true)
const indexes = ref<number[]>([])

/** 导出弹窗状态 */
const exportDialogOpen = ref(false)
const exportFilename = ref('')
const exportSelectedKeys = ref<string[]>([])

/** 表格列配置 */
const columns = shallowRef<XTableV2Column<OrderTableView>[]>([])

/** 线程数存储 key */
const threadKey = import.meta.env.VITE_THREAD_STORAGE

/** 重置按钮下拉选项 */
const btnSplitOpts: XBtnSplitOptions = [
  // {
  //   label: localStore.localData['submit_Reset'],
  //   icon: "",
  //   command: () => resetSelectRow(),
  // },
  {
    label: localStore.localData['submit_ResetSuccess'],
    icon: "",
    command: () => resetOrder(ORDER_STATUS.SUCCESS),
  },
  {
    label: localStore.localData['submit_ResetFailed'],
    icon: "",
    command: () => resetOrder(ORDER_STATUS.FAILED),
  },
  {
    label: localStore.localData['submit_ResetSuccessNew'],
    icon: "",
    command: () => resetNotCoverOrder(ORDER_STATUS.SUCCESS),
  },
  {
    label: localStore.localData['submit_ResetFailedNew'],
    icon: "",
    command: () => resetNotCoverOrder(ORDER_STATUS.FAILED),
  },
]

/** 初始化默认列 */
const defaultColumns = await getDefaultColumns()
columns.value = defaultColumns.columns
triggerRef(columns)

/** 内部变量 */
let count = 0
let headers: string[] = []
let cacheImei: boolean = false
let pendingOrders: number[] = []
let orderImeis: Record<string, number> = {}
let deletedColumns: XTableV2Column<OrderTableView>[] = []
let lastServiceId: number | undefined = undefined
let isUseStoraged: boolean = false

/**
 * 订单列表计算属性
 * 根据列筛选条件和搜索关键字过滤订单
 */
const orders = computed(() => {
  return store.rawOrders.filter(row => {
    return columns.value.every(col => {
      if (!col.identifier?.isFilter) return true

      const key = col.key
      const rawValue = row[key]
      const value = normalizeFilterValue(rawValue)

      if (store.visibleFilters[key] && !store.visibleFilters[key].includes(value)) {
        return false
      }

      const keyword = store.filterData[key]
      if (keyword && !value.includes(keyword)) {
        return false
      }

      return true
    })
  })
})

/**
 * 必读内容计算属性
 * 获取当前选中服务的必读说明
 */
const mustRead = computed(() => {
  const service = serviceStore.services.get(store.selectId!)
  return service ? service.mustRead : null
})

/**
 * 监听路由参数变化
 * 当路由中的服务 ID 变化时，切换服务并导入 IMEI
 */
watch(
  () => route.params,
  async (params) => {
    const id = params.id

    if (isNumeric(id)) {
      store.selectId = +id
      const service = serviceStore.services.get(store.selectId)

      await handleSelected(store.selectId)

      if (service) {
        const imei = (params.imei as string | undefined) ?? ''
        const imeis = getSubmitImei(imei, service.imeiType, service?.domesticSerialType)
        handleImport(imeis, '')
      }
    }
  },
  {
    deep: true,
    immediate: true,
  }
)

/**
 * 监听全部显示切换
 * 切换显示全部订单时重新加载
 */
watch(
  () => showAll.value,
  async () => {
    if (!selService.value) return
    await handleSubmitOrder(selService.value.id)
  }
)

/**
 * 获取默认列配置
 */
async function getDefaultColumns() {
  const data = await processedServiceFields(0)
  return data
}

/**
 * 处理服务选择
 * @param value - 服务 ID
 */
async function handleSelected(value: number) {
  if (!value) return
  close()

  if (lastServiceId) {
    const rejectedOrders = getSubmitedRejectOrder()

    if (rejectedOrders.length > 0) {
      const deleteData: DeleteImeiPrams = {
        serviceId: lastServiceId,
        imeiList: rejectedOrders.map(x => x.imei),
        idList: [],
      }

      await orderApi.deleteCacheImei(deleteData)
    }
  }

  lastServiceId = value

  store.rawOrders.length = 0
  count = 0
  disabled.value = false

  selService.value = serviceStore.services.get(value)!

  loadFavorites()

  await handleServiceCols(value)

  const key = import.meta.env.VITE_SUBMIT_STORGE
  const isStoraged = localStorage.getItem(`${key}_${value}`)
  if (isStoraged || showAll.value) {
    await handleSubmitOrder(value)

    if (
      store.rawOrders.some(x => x.status === ORDER_STATUS.PROCESSING)
      || store.rawOrders.some(x => x.status === ORDER_STATUS.WAIT)
    ) {
      isUseStoraged = true
    }
  }

  const { data } = await orderApi.cacheImei({ serviceId: value })
  if (data.length > 0) {
    cacheImei = true
    await handleImport(data, '')
  }

  refreshStatOrders()
}

/**
 * 统计原始订单状态
 * @returns 各状态订单数量统计
 */
function statRawOrder(): OrderProgressResp {
  const orders = store.rawOrders

  return {
    total: orders.length,
    waiting: orders.filter(x => x.status === ORDER_STATUS.WAIT).length,
    processing: orders.filter(x => x.status === ORDER_STATUS.PROCESSING).length,
    success: orders.filter(x => x.status === ORDER_STATUS.SUCCESS).length,
    failed: orders.filter(x => x.status === ORDER_STATUS.FAILED && !!x.id).length,
    reject: orders.filter(x => x.status === ORDER_STATUS.FAILED && !x.id).length
  }
}

/**
 * 获取已提交的拒绝订单
 */
function getSubmitedRejectOrder() {
  return store.rawOrders.filter(x => x.status === ORDER_STATUS.FAILED && !x.id)
}

/**
 * 处理服务列配置
 * @param value - 服务 ID
 */
async function handleServiceCols(value: number) {
  const { columns: _columns, fields } = await processedServiceFields(value)
  columns.value = _columns

  headers = fields.filter(x => x.type === ServiceFieldType.Dynamic).map(item => iStore.isEn ? (item.nameEn ? item.nameEn : item.name) : item.name)
  serviceColumns.value = fields.map(item => ({ name: item.name, nameEn: item.nameEn }))
  store.serviceCols = columns.value
    .filter(x => x.identifier && x.identifier['isDelCol'])
    .map(item => ({
      key: item.key,
      title: item.title,
      width: item.width ? +item.width : 180,
      minWidth: item.width ? +item.width : 180,
      isDynamic: true,
    })
    )

  store.selectHeaders = columns.value
    .filter(x => x.identifier && x.identifier['isDelCol'])
    .map(c => c.key)

  triggerRef(columns)
}

/**
 * 提交订单列表
 * @param id - 服务 ID
 */
async function handleSubmitOrder(id: number) {
  const key = import.meta.env.VITE_SUBMIT_STORGE
  const jsonStr = localStorage.getItem(`${key}_${id}`)

  const idList = (jsonStr && !showAll.value) ? JSON.parse(jsonStr) as number[] : []

  const data = await getSubmitOrderList(idList)

  submited.value = true

  store.rawOrders = data.map((item, i) => ({
    ...item,
    ...(processOrderResult(item.result)),
    ...({ result: item.result }),
    index: i + 1,
    isStorage: true,
  }))

  pendingOrders = data.map(item => {
    if (item.status === ORDER_STATUS.PROCESSING) {
      return item.id
    }
    return null
  }).filter((item): item is number => item !== null)

  refreshStatOrders()
}

/**
 * 处理导入 IMEI
 * @param imeiList - IMEI 列表
 * @param remark - 备注
 */
async function handleImport(imeiList: string[], remark: string) {
  if (!selService.value) return
  if (disabled.value) return toast.warning(localStore.localData['submit_WaitOrder'])
  if (imeiList.length === 0) return

  tableRef.value?.initFilter()
  close()

  imeis.value = [
    ...new Set([
      ...imeis.value,
      ...store.rawOrders
        .filter(x => x.status === ORDER_STATUS.WAIT)
        .map(x => x.imei).filter(x => !!x),
      ...imeiList
    ])
  ]

  const submitedOrders = processWaitList(store.selectId!, imeis.value, remark)
  store.rawOrders.splice(0, getWaitingOrderLength(store.rawOrders), ...submitedOrders)

  processRawOrder()

  if (!cacheImei) {
    await orderApi.cacheImei({ imeiList: imeis.value, serviceId: selService.value.id })
  }

  store.visibleGress = true

  refreshStatOrders()

  submited.value = false
  comments.value = remark
  count = imeis.value.length
  cacheImei = false

  orderTableRef.value?.scrollToTop()
}

/**
 * 重新处理订单序号
 */
function processRawOrder() {
  let index = 0
  let orders = []
  for (let order of store.rawOrders) {
    orders.push({
      ...order,
      index: ++index,
    })
  }

  store.rawOrders = orders
}

/**
 * 获取等待处理的订单数量
 * @param rawOrders - 原始订单列表
 * @returns 等待处理订单数量
 */
function getWaitingOrderLength(rawOrders: OrderTableView[]) {
  const waitProcessOrder = rawOrders.filter(o => o.status === ORDER_STATUS.WAIT)
  return waitProcessOrder.length
}

/**
 * 获取提交订单列表
 * @param orderIds - 订单 ID 列表
 */
async function getSubmitOrderList(orderIds: number[]) {
  loading.value = true
  const params: SubmitOrderListParams = {
    serviceId: store.selectId!,
    codeIdList: orderIds,
    showAll: showAll.value,
  }
  const { data } = await orderApi.submitOrders(params)
  loading.value = false

  setTimeout(() => {
    disabled.value = false
  }, 1500)

  return data
}

/**
 * 处理订单结果，解析返回内容
 * @param content - 返回内容字符串
 * @returns 解析后的结果对象
 */
function processOrderResult(content: string) {
  const result: Record<string, string> = {}
  const items = content.split('<br>')

  const keyMap = getFieldsMap(serviceColumns.value)

  if (items.length === 1 && serviceColumns.value.length === 1) {
    const key = iStore.isEn ? (serviceColumns.value[0].nameEn ?? serviceColumns.value[0].name) : serviceColumns.value[0].name
    result[key] = content
  } else {
    for (const item of items) {
      const [key, ...valueParts] = item.split(/[:：]/)
      const rawKey = key.trim()
      const value = valueParts.join(":").trim()

      const mapped = keyMap[rawKey]
      if (!mapped) continue

      const finalKey = iStore.isEn ? mapped.en ? mapped.en : mapped.cn : mapped.cn
      result[finalKey] = value
    }
  }

  const isSuccess = judgeOrderStatus(serviceColumns.value, items)

  if (!isSuccess) {
    result[headers[0]] = content
  }

  return result
}

/**
 * 处理等待列表，生成初始订单数据
 * @param id - 服务 ID
 * @param imeiList - IMEI 列表
 * @param remark - 备注
 */
function processWaitList(id: number, imeiList: string[], remark: string) {
  const service = serviceStore.services.get(id)
  const buckets: OrderTableView[] = []

  for (let i = 0; i < imeiList.length; i++) {
    const initData: any = {
      id: 0, index: i + 1,
      serviceId: service ? service.id : null,
      serviceName: service ? service.title : null,
      credits: service ? service.price : 0,
      status: ORDER_STATUS.WAIT,
      submitedStatus: ASYNC_ORDER_STATUS.WAIT,
      verify: ORDER_VERIFY.NORMAL,
      imei: imeiList[i],
      remark: remark,
      result: '',
      createTime: '',
      isStorage: false,
    }

    serviceColumns.value.forEach(item => {
      const name = iStore.isEn ? item.nameEn : item.name
      initData[name!] = ""
    })

    buckets.push(initData)
  }

  return buckets
}

/**
 * 获取字段映射表
 * @param fields - 字段列表
 * @returns 字段映射对象
 */
function getFieldsMap(fields: ServiceColumnItem[]) {
  const fieldsCN = fields.map(item => item.name)
  const fieldsEN = fields.map(item => item.nameEn)
  const result: Record<string, FieldMap> = {}

  for (let i = 0; i < fieldsCN.length; i++) {
    const cn = fieldsCN[i]
    const en = fieldsEN[i]

    result[cn] = { cn, en }

    if (en !== null && en !== "") {
      result[en] = { cn, en }
    }
  }

  return result
}

/**
 * 判断订单状态
 * @param fields - 字段列表
 * @param items - 内容项列表
 * @returns 是否成功
 */
function judgeOrderStatus(fields: ServiceColumnItem[], items: string[]) {
  const fieldsCN = fields.map(item => item.name)
  const fieldsEN = fields.map(item => item.nameEn)

  return items.some(item => {
    let texts = item.split(":")

    return texts.some(text => {
      return fieldsCN.includes(text) || fieldsEN.includes(text)
    })
  })
}

/**
 * 提交订单
 */
async function handleSubmit() {
  if (submitLoading.value) return
  close()

  const submitOrders = store.rawOrders.map(item => {
    if (item.status === ORDER_STATUS.WAIT) {
      return item
    }
    return null
  }).filter(Boolean)

  if (submited.value || submitOrders.length === 0) return toast.warning(localStore.localData['submit_Repeatedly'])
  const service = serviceStore.services.get(store.selectId!)

  if (!service) return toast.warning(localStore.localData['submit_ServicePlaceholderTable'])
  if (orders.value.length === 0) return toast.warning(localStore.localData['submit_ExportOrders'])
  submitLoading.value = true

  if (count === 0) {
    count = imeis.value.length
  }

  disabled.value = true

  await serviceApi.setThread(threads.value)

  imeis.value = [...new Set([...imeis.value, ...store.rawOrders.filter(x => x.status === ORDER_STATUS.WAIT).map(x => x.imei).filter(x => !!x)])]

  if (service.isUnlock) return submitOrder(service)
  submitQueryOrder(service)
}

/**
 * 提交订单（普通模式）
 * @param service - 服务信息
 */
function submitOrder(service: Service) {
  const params = {
    groupId: service.parentId,
    serviceId: service.id,
    imeiList: imeis.value,
    remark: comments.value,
    isBulk: !pushMsg.value,
    language: locale.value,
  }

  const response = orderApi.submit(params)
  submited.value = true
  response.then(({ data }) => {
    store.visibleGress = true
    serviceStore.addRecentService(service.id)

    if (service.isUnlock) {
      toast.success(localStore.localData['submit_SubmitSuccess'])
      disabled.value = false
    }

    pendingOrders = data
      .map(item => item.status === ORDER_STATUS.PROCESSING ? item.codeId : null)
      .filter((x): x is number => x !== null)

    uStore.updateCredit()
    renderSubmitOrderResult(data)

    refreshStatOrders()
  })

  response.catch((err) => {
    console.error(`[3un] ${t('submit.fail', { action: t('query.submit') })}`, err)
    submited.value = false
    close()
  })

  response.finally(() => {
    submitLoading.value = false
    imeis.value = []
    reseted.value = false
  })
}

/**
 * 提交订单（WebSocket 查询模式）
 * @param service - 服务信息
 */
function submitQueryOrder(service: Service) {
  const { data, status } = connect({
    serviceId: service.id,
    type: 'order'
  })

  watch(
    status,
    (value) => {
      if (value !== 'OPEN') {
        console.warn(`[3un] WebSocket ${t('action.submit.fail', { action: t('action.connect') })}`, value)
        return
      }

      submitOrder(service)
    },
    { once: true }
  )

  watch(data, (value) => {
    if (!value) return

    handleOrder(value)
    handleCount()
  })
}

/**
 * 渲染提交订单结果
 * @param data - 提交结果数据
 */
function renderSubmitOrderResult(data: OrderSubmitResult[]) {
  const errMsgCol = headers[0]

  for (let item of data) {
    let index = store.rawOrders.findIndex(order => order.imei === item.imei)
    const keys = Object.keys(orderImeis)
    if (keys.includes(item.imei)) {
      index = orderImeis[item.imei]
    }

    if (index === -1) return console.error(`[3un] ${t('query.prompt.imeiNotExist')}`, item)

    const isFailed = item.status === ORDER_STATUS.FAILED
    if (isFailed) handleCount()

    store.rawOrders[index] = {
      ...store.rawOrders[index],
      ...({ [errMsgCol]: item.message }),
      result: item.message,
      status: item.status,
      submitedStatus: item.status === ORDER_STATUS.FAILED ? ASYNC_ORDER_STATUS.ASYNC_FAILED : undefined,
      id: item.codeId,
    }
  }

  const key = import.meta.env.VITE_SUBMIT_STORGE
  const service = serviceStore.services.get(store.selectId!)
  let idList = data.map(item => item.codeId).filter((x): x is number => x !== null)
  if (imeis.value && !showAll.value) {
    idList = store.rawOrders.map(item => item.id).filter((x): x is number => x !== null)
  }
  localStorage.setItem(`${key}_${service?.id}`, JSON.stringify(idList))
}

/**
 * 处理 WebSocket 返回的订单数据
 * @param rawData - 原始数据字符串
 */
function handleOrder(rawData: string) {
  const data = JSON.parse(rawData) as Order

  let index = store.rawOrders.findIndex(order => order.imei === data.imei)
  if (index === -1) return console.error('[3un] IMEI 不存在', data)

  if (orderImeis[data.imei]) {
    index = orderImeis[data.imei]
  }

  const resultCol = columns.value.find(x => x.key === 'result')
  const hasResult = resultCol && resultCol.key === 'result'

  store.rawOrders[index] = {
    ...store.rawOrders[index],
    ...(hasResult && { result: data.result }),
    ...processOrderResult(data.result),
    status: data.status,
    id: data.id,
    result: data.result,
    recommends: data.recommends,
  }

  store.progressData = statRawOrder()
}

/**
 * 处理计数，减少等待数量
 */
function handleCount() {
  count = count - 1

  if (count === 0) {
    disabled.value = false
    return close()
  }
}

/**
 * 打开导出配置弹窗
 */
function openExportDialog() {
  let ids = store.rawOrders.map((item) => item.id).filter(item => item !== null && item !== undefined)

  if (indexes.value.length > 0) {
    ids.length = 0
    for (const index of indexes.value) {
      const order = store.rawOrders.find((o) => o.index === index)
      if (order && order.id) ids.push(order.id)
    }
  }

  if (!store.selectId || !ids?.length) {
    toast.warning(localStore.localData['submit_ExportOrders'])
    return
  }

  const service = serviceStore.services.get(store.selectId)
  if (!submited.value && !service?.isUnlock) {
    toast.warning(localStore.localData['submit_NoFinshedOrder'])
    return
  }

  exportSelectedKeys.value = columns.value.map(c => String(c.key))
  const defaultName = selService.value
    ? `${selService.value.title}_${new Date().toISOString().slice(0, 10)}`
    : `export_${new Date().toISOString().slice(0, 10)}`
  exportFilename.value = defaultName
  exportDialogOpen.value = true
}

/**
 * 确认导出
 */
function confirmExport() {
  let ids = store.rawOrders.map((item) => item.id).filter(item => item !== null && item !== undefined)

  if (indexes.value.length > 0) {
    ids.length = 0
    for (const index of indexes.value) {
      const order = store.rawOrders.find((o) => o.index === index)
      if (order && order.id) ids.push(order.id)
    }
  }

  const selectedKeys = new Set(exportSelectedKeys.value)
  const allKeys = columns.value.map(c => String(c.key))
  const deleteExcelHead = allKeys.filter(k => !selectedKeys.has(k))

  const excelHead = headers

  exportLoading.value = true
  const fileName = exportFilename.value.trim() || undefined
  const response = orderApi.submitExport({
    serviceId: store.selectId!,
    orderIdList: ids,
    excelHead,
    deleteExcelHead,
    fileName,
  })

  response.then(({ data }) => downloadURL(data))
  response.finally(() => {
    exportLoading.value = false
    exportDialogOpen.value = false
  })
}

/**
 * 重置所有订单
 */
async function reset() {
  const neededDeleteData = indexes.value.length > 0 ? buildDeletedData(indexes.value) : []

  if (selService.value) {
    const key = import.meta.env.VITE_SUBMIT_STORGE
    const id = selService.value.id
    const storageOrderIdsStr: string | null = localStorage.getItem(`${key}_${id}`) as string | null

    try {
      await orderApi.deleteCacheImei({
        serviceId: selService.value.id,
        imeiList: neededDeleteData.map(x => x.imei),
        idList: neededDeleteData.map(x => x.codeId).filter(x => x !== null)
      })

      if (indexes.value.length > 0) {
        const deleteSet = new Set(indexes.value)
        if (storageOrderIdsStr !== null) {
          const storageOrderIds: string[] = JSON.parse(storageOrderIdsStr)
          const needRemoveOrder = store.rawOrders.filter(x => deleteSet.has(x.index)).map(x => x.id?.toString())
          const needStoragedIds = storageOrderIds.filter(x => !needRemoveOrder.includes(x.toString()))

          localStorage.setItem(`${key}_${id}`, JSON.stringify(needStoragedIds))
        }
        store.rawOrders = store.rawOrders
          .filter(item => !deleteSet.has(item.index))
          .map((item, index) => ({
            ...item,
            ...({ index: index + 1 })
          }))
      } else {
        store.rawOrders = []
        localStorage.removeItem(`${key}_${id}`)
        showAll.value = false
      }
      indexes.value = []
      disabled.value = false
      orderTableRef.value?.initCheckedRows()

      refreshStatOrders()
    } catch (ex) {
      // ignore
    }
  }

  router.replace({ query: {} })

  imeis.value = []
  submited.value = false
  comments.value = ''
  count = 0
  close()
}

/**
 * 构建删除数据
 * @param data - 索引列表
 * @returns 删除数据项列表
 */
function buildDeletedData(data: number[]) {
  const result: DeleteDataItem[] = []
  for (let index of data) {
    const item = store.rawOrders.find(x => x.index === index)

    const data: DeleteDataItem | undefined = item
      ? {
        imei: item.imei,
        codeId: item.id
      }
      : undefined

    if (data) {
      result.push(data)
    }
  }

  return result
}

/**
 * 刷新订单状态
 */
async function handleFresh() {
  if (store.rawOrders.length === 0) return toast.warning(localStore.localData['submit_ExportOrders'])

  pendingOrders = store.rawOrders.map(item => {
    if (item.status === ORDER_STATUS.PROCESSING || item.status === ORDER_STATUS.WAIT) {
      return item.id
    }
    return null
  }).filter((item): item is number => item !== null)

  if (!store.visibleGress && pendingOrders.length === 0) return toast.info(localStore.localData['submit_AllOrderFinsh'])
  disabled.value = false
  const data = await getSubmitOrderList(pendingOrders)

  for (let item of data) {
    const index = store.rawOrders.findIndex(order => order.id === item.id)

    if (index === -1) continue

    store.rawOrders[index] = {
      ...store.rawOrders[index],
      ...(processOrderResult(item.result)),
      ...({ result: item.result }),
      status: item.status,
    }
  }
  disabled.value = true

  refreshStatOrders()
}

/**
 * 重置订单状态（覆盖模式）
 * @param status - 订单状态
 */
function resetOrder(status: ORDER_STATUS) {
  if (count > 0) return toast.warning(localStore.localData['submit_ProcessingOrder'])
  if (reseted.value) return toast.warning(localStore.localData['submit_FirstSubmit'])
  if (!store.rawOrders.some(o => o.status === status)) return

  submited.value = false
  const data = store.rawOrders.filter(item => item.status === status)
  const dataImeis = [...new Set(data.map(item => item.imei))]

  if (dataImeis.length > 0) {
    reseted.value = true
  }
  reseted.value = true

  for (let imei of dataImeis) {
    const indexes = store.rawOrders
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => item.imei === imei)
      .map(({ idx }) => idx)

    for (let index of indexes) {
      const order = store.rawOrders[index]

      if (order.status !== status) continue

      store.rawOrders[index] = {
        ...store.rawOrders[index],
        status: ORDER_STATUS.WAIT,
        submitedStatus: ASYNC_ORDER_STATUS.WAIT,
        result: "",
      }

      for (let column of serviceColumns.value) {
        const label = iStore.isEn ? column.nameEn : column.name
        if (label === null) continue

        (store.rawOrders[index] as any)[label] = ""
      }

      orderImeis[imei] = index

      break
    }
  }

  imeis.value = Object.keys(orderImeis)
  refreshStatOrders()
}

/**
 * 重置订单状态（非覆盖模式）
 * @param status - 订单状态
 */
function resetNotCoverOrder(status: ORDER_STATUS) {
  if (count > 0) return toast.warning(localStore.localData['submit_ProcessingOrder'])
  if (reseted.value) return toast.warning(localStore.localData['submit_FirstSubmit'])
  if (!store.rawOrders.some(o => o.status === status)) return

  submited.value = false
  const data = store.rawOrders.filter(item => item.status === status)
  imeis.value = [...new Set(data.map(item => item.imei))]
  reseted.value = true
  handleImport(imeis.value, "")

  refreshStatOrders()
}

/**
 * 重置选中的行
 */
function resetSelectRow() {
  if (count > 0) return toast.warning(localStore.localData['submit_ProcessingOrder'])
  if (submitLoading.value) return toast.warning(localStore.localData['submit_ProcessingOrder'])
  if (indexes.value.length === 0) {
    return toast.warning(localStore.localData['submit_Row'])
  }

  orderImeis = {}
  submited.value = false
  for (let index of indexes.value) {
    const arrIndex = index - 1
    const order = store.rawOrders[arrIndex]
    orderImeis[order.imei] = arrIndex

    store.rawOrders[arrIndex] = {
      ...store.rawOrders[arrIndex],
      status: ORDER_STATUS.WAIT,
      submitedStatus: ASYNC_ORDER_STATUS.WAIT,
      result: "",
    }

    for (let column of serviceColumns.value) {
      const label = iStore.isEn ? column.nameEn : column.name
      if (label === null) continue
      (store.rawOrders[arrIndex] as any)[label] = ""
    }
  }

  imeis.value = Object.keys(orderImeis)

  refreshStatOrders()
}

/**
 * 显示服务必读说明
 */
async function handleMustRead() {
  const result = await xconfirm({
    title: localStore.localData['submit_ServiceDescription'],
    text: mustRead.value || '',
    confirmText: localStore.localData['submit_FieldsDialogConfirm'],
    cancelText: undefined,
  })

  if (!result) pushMsg.value = true
}

/**
 * 处理推送消息开关变化
 * @param value - 开关值
 */
async function handlePushMsgChange(value: boolean) {
  if (value) return

  const result = await xconfirm`
    ${localStore.localData['submit_PushResultToast']}
  `
  if (!result) pushMsg.value = true
}

/**
 * 处理删除表头列
 * @param column - 要删除的列
 */
function handleDeleteHeader(column: XTableV2Column<OrderTableView>) {
  const headerIndex = store.selectHeaders.findIndex(item => item === column.key.toString())
  const columnIndex = columns.value.findIndex(c => c.key === column.key)
  if (headerIndex !== -1) {
    store.selectHeaders.splice(headerIndex, 1)
  }

  if (columnIndex !== -1) {
    columns.value = columns.value.filter(c => c.key !== column.key)
    deletedColumns.push(column)
  } else {
    deletedColumns = deletedColumns.filter(c => c.key !== column.key)
  }

  processResultColumns()
}

/**
 * 处理结果列显示
 */
function processResultColumns() {
  const deleteKeys = deletedColumns.map(c => c.key)
  const isAllServiceColsDel = headers.every(c => deleteKeys.includes(c))
  const resultCol = defaultColumns.columns.find(x => x.key === 'result')
  if (!resultCol) return

  const index = columns.value.findIndex(c => c.key === resultCol.key)
  if (isAllServiceColsDel) {
    if (index === -1) {
      columns.value.push(resultCol)
    }
  } else {
    if (index !== -1) {
      columns.value.splice(index, 1)
    }
  }
}

/**
 * 处理表头确认
 * @param headers - 表头配置列表
 */
function processHeaderConfirm(headers: ServiceCols[]) {
  const selectableKeys = store.serviceCols.map(c => c.key.toString())
  const selectedKeys = headers.map(h => h.key.toString())

  const nextColumns: XTableV2Column<OrderTableView>[] = []
  const nextDeleted: XTableV2Column<OrderTableView>[] = []

  for (const col of columns.value) {
    const key = col.key.toString()
    const isSelectable = selectableKeys.includes(key)
    const isSelected = selectedKeys.includes(key)

    if (!isSelectable) {
      nextColumns.push(col)
    } else if (isSelected) {
      nextColumns.push(col)
    } else {
      nextDeleted.push(col)
    }
  }

  for (const col of deletedColumns) {
    const key = col.key.toString()
    if (selectedKeys.includes(key)) {
      nextColumns.push(col)
    } else {
      nextDeleted.push(col)
    }
  }

  columns.value = nextColumns
  deletedColumns.splice(0, deletedColumns.length, ...nextDeleted)

  processResultColumns()
}

/**
 * 处理选中的行索引
 * @param keys - 行键列表
 */
function handleSelectedIndex(keys: RowKey[]) {
  if (keys.every(x => typeof x === "number")) {
    indexes.value = keys
  }
}

/**
 * 复制选中行的 IMEI/SN
 */
function handleCopyImei() {
  if (indexes.value.length === 0) {
    toast.warning(localStore.localData['history_SelectOrder_Toast'])
    return
  }

  const res: string[] = []
  for (const index of indexes.value) {
    const order = store.rawOrders.find((o) => o.index === index)
    if (order?.imei) res.push(order.imei)
  }

  copy(res.join('\n'))
  toast.success(localStore.localData['history_Copied_Toast'])
}

/**
 * 清理未完成的订单
 */
async function cleanup() {
  if (lastServiceId) {
    const rejectedOrders = getSubmitedRejectOrder()

    if (rejectedOrders.length > 0) {
      const deleteData: DeleteImeiPrams = {
        serviceId: lastServiceId,
        imeiList: rejectedOrders.map(x => x.imei),
        idList: [],
      }

      await orderApi.deleteCacheImei(deleteData)
    }
  }
}

/**
 * 刷新统计数据
 */
function refreshStatOrders() {
  store.progressData = statRawOrder()
  if (store.rawOrders.length > 0) {
    store.refreshProgress = !store.refreshProgress
    store.visibleGress = true
  }
}

/**
 * 处理数据变化
 */
function processHasChange() {
  const service = serviceStore.services.get(store.selectId)
  if (service?.isUnlock || isUseStoraged) {
    handleFresh()
  }
}

/**
 * 处理线程数变化（防抖）
 */
const handleThreadChange = debounce(async () => {
  localStorage.setItem(`${threadKey}_${uStore.info.userId}`, threads.value.toString())
  await serviceApi.setThread(threads.value)
})

/**
 * 组件挂载时初始化线程数配置
 */
onMounted(() => {
  const raw = localStorage.getItem(`${threadKey}_${uStore.info.userId}`)
  if (raw === null) {
    threads.value = 5
    return
  }

  const value = Number(raw)

  let result = 5

  if (Number.isFinite(value)) {
    if (value < 1) result = 1
    else if (value > 20) result = 20
    else result = value
  }

  threads.value = result
})

/**
 * 组件卸载前清理
 */
onBeforeUnmount(() => {
  cleanup().finally()
})

/** 按钮配置数组 */
const btnArr = [
  {
    label: localStore.localData['submit_Submit'],
    click: handleSubmit,
    color: 'success',
    icon: 'bi:cloud-upload'
  },
  {
    label: localStore.localData['submit_Export'],
    click: openExportDialog,
    color: 'warning',
    icon: 'tdesign:folder-export'
  },
  {
    label: localStore.localData['submit_Clear'],
    click: reset,
    color: 'danger',
    icon: 'ant-design:clear-outlined'
  },
]
</script>

<template>
  <div class="p-2 pt-0 h-full  pb-4 flex flex-col">
    <!-- 服务信息及操作栏 -->
    <section
      class="overflow-x-auto whitespace-nowrap  flex flex-col items-start justify-start space-y-1.5 flex-wrap mb-1">
      <!-- 服务信息 -->
      <div class="flex justify-center items-center">
        <div v-if="selService" class="flex items-center gap-2 pt-1 text-[9px] md:text-md text-muted-foreground">
          <button @click="toggleFavorite(selService.id)"
            :class="favoriteIds.includes(selService.id) ? 'bg-yellow-500/20 border border-yellow-500/20 ' : 'border bg-gray-500/10'"
            class="flex-shrink-0 p-1 rounded-md flex flex-col justify-center items-center">
            <Icon :icon="favoriteIds.includes(selService.id) ? 'tabler:star-filled' : 'tabler:star'" :class="[
              'size-4',
              favoriteIds.includes(selService.id) ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-500'
            ]" />
            <div :class="[

              favoriteIds.includes(selService.id) ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-500'
            ]">
              {{ favoriteIds.includes(selService.id) ? localStore.localData['submit_Remove'] :
                localStore.localData['submit_Favorite'] }}

            </div>
          </button>

          <div>
            <span :class="ua.isMobile ? 'text-[12px]' : 'text-[16px]'" class="font-semibold text-blue-500">{{
              selService.title }}</span>
            <div class="flex gap-2">
              <div class="flex space-x-1 items-center" :class="ua.isMobile ? 'text-[10px]' : 'text-[12px]'">
                <span>{{ localStore.localData['submit_old_Points'] }}: </span>
                <div class=" text-blue-500 font-bold">{{ selService.price }}</div>
              </div>
              <span :class="ua.isMobile ? 'text-[10px]' : 'text-[12px]'" v-if="selService.taken">{{
                localStore.localData['submit_old_Duration'] }}: {{
                  selService.taken }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮组 -->
      <div class="flex gap-1 text-[9px] md:text-sm flex-wrap">
        <ImportPlane :selected-id="store.selectId" @submit="handleImport" />

        <XButton :size="ua.isMobile ? 'sm' : 'md'" :color="item.color as any" v-for="item in btnArr" @click="item.click"
          :label="item.label" :icon="item.icon" variant="outline" />

        <XButton v-if="selService" @click="handleFresh" :label="localStore.localData['submit_QueryResult']"
          :size="ua.isMobile ? 'sm' : 'md'" color="primary" variant="soft" />

        <XButton @click="handleCopyImei" :label="localStore.localData['history_CopyIMEI']"
          :size="ua.isMobile ? 'sm' : 'md'" color="success" variant="soft" />

        <XButton v-show="serviceColumns.length !== 0" @click="store.visibleHeaderFilter = true"
          :label="localStore.localData['submit_FieldsFilter']" :size="ua.isMobile ? 'sm' : 'md'" variant="soft"
          color="danger" />

        <XButton v-show="mustRead" @click="handleMustRead" :label="localStore.localData['submit_ServiceDescription']"
          :size="ua.isMobile ? 'sm' : 'md'" color="warning" variant="soft" />

        <div>
          <XButtonSplit :size="ua.isMobile ? 'sm' : 'md'" :label="localStore.localData['submit_Reset']"
            :options="btnSplitOpts" @click="resetSelectRow" />
        </div>
      </div>

      <!-- 重置按钮组 -->
      <!-- <div class="flex items-center justify-center gap-1 text-[9px] md:text-sm">
        <button v-for="option in btnSplitOpts" :key="option?.label || ''" @click="option?.command?.()"
          class="px-2 py-1 rounded-md bg-gray-500/10 hover:bg-gray-400/40">
          {{ option?.label || '' }}
        </button>
      </div> -->

      <!-- 配置选项 -->
      <div class="flex items-center space-x-2">
        <label class="flex items-center">
          <span class="text-muted-foreground text-[9px] md:text-sm">{{ localStore.localData['submit_PushResult']
          }}:</span>
          <XSwitch v-model="pushMsg" @change="handlePushMsgChange" />
        </label>

        <label v-if="store.selectId" class="flex items-center">
          <span class="text-muted-foreground text-[9px] md:text-sm">{{ localStore.localData['submit_ShowAll'] }}:</span>
          <XSwitch v-model="showAll" @change="count = 0" />
        </label>

        <label class="flex items-center space-x-2">
          <span class="text-muted-foreground text-[9px] md:text-sm">{{ localStore.localData['submit_ThreadCount']
          }}:</span>
          <XInputNumber v-model="threads" :step="1" :precision="0" :min="1" :max="10" @change="handleThreadChange" />
        </label>
      </div>
    </section>

    <!-- 表格区域 -->
    <section class="flex-1 min-h-0">
      <XTableV2 uiHeader="py-1 text-[9px] md:text-sm" ui-column="text-[8px] px-0 md:text-sm" ref="orderTableRef"
        :columns="columns" :data="orders" selection select-key="index" @selected="handleSelectedIndex" />
    </section>

    <!-- 订单进度 -->
    <OrderProgress @changed="processHasChange" />

    <!-- 列配置弹窗 -->
    <TableColumnDialog @confirm="processHeaderConfirm" />

    <!-- 解锁推荐弹窗 -->
    <UnlockRecommendDialog />

    <!-- 导出配置弹窗 -->
    <XDialog v-model="exportDialogOpen" :title="localStore.localData['submit_old_ExportConfiguration']"
      :maskClosable="false" uiRoot="max-w-[95vw] sm:max-w-md">
      <template #default>
        <div class="space-y-4 text-[9px] md:text-sm">
          <!-- 文件名 -->
          <div>
            <label class="block mb-1 font-medium">{{ localStore.localData['submit_old_FileName'] }}</label>
            <input v-model="exportFilename" type="text" :placeholder="localStore.localData['submit_old_fileNameInput']"
              class="w-full px-3 py-2 border  rounded bg-white dark:bg-black " />
          </div>

          <!-- 导出字段 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="font-medium">{{ localStore.localData['submit_old_ExportFields'] }}</label>
              <div class="flex gap-2">
                <button @click="exportSelectedKeys = columns.map(c => String(c.key))"
                  class="text-blue-600 hover:underline">
                  {{ localStore.localData['submit_old_SelectAll'] }}
                </button>
                <button @click="exportSelectedKeys = []" class="text-blue-600 hover:underline">
                  {{ localStore.localData['submit_old_DeselectAll'] }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-64 overflow-auto border  rounded p-2">
              <label v-for="col in columns" :key="String(col.key)"
                class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                <input type="checkbox" :checked="exportSelectedKeys.includes(String(col.key))" @change="(e: Event) => {
                  const v = String(col.key)
                  const checked = (e.target as HTMLInputElement).checked
                  const idx = exportSelectedKeys.indexOf(v)
                  if (checked && idx === -1) exportSelectedKeys.push(v)
                  else if (!checked && idx !== -1) exportSelectedKeys.splice(idx, 1)
                }" />
                <span class="truncate">{{ col.title }}</span>
              </label>
            </div>
            <div v-if="exportSelectedKeys.length === 0" class="text-red-500 mt-1">
              {{ localStore.localData['submit_old_ExportToast'] }}
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end items-center space-x-2 mt-2">
          <XButton variant="soft" :label="localStore.localData['submit_FieldsDialogCancel']"
            @click="exportDialogOpen = false" />
          <XButton :disabled="exportSelectedKeys.length === 0 || exportLoading" :loading="exportLoading"
            :label="localStore.localData['submit_Export']" @click="confirmExport" />
        </div>
      </template>
    </XDialog>
  </div>
</template>