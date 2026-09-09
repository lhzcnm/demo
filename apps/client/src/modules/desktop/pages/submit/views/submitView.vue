<script setup lang="ts">
import OrderProgress from '../components/OrderProgress.vue'
import SelectService from '@desktop/components/SelectService.vue'
import ImportPlane from '../components/ImportPlane.vue'
import TableColumnDialog from '../components/TableColumnDialog.vue'

import { toast } from 'vue-sonner'
import { useClipboard } from '@vueuse/core'
import {
  isNumeric,
  XTableV2,
  type XTableV2Expose,
  type RowKey,
  type XBtnSplitOptions,
  type XTableExpose,
  type XTableV2Column
} from '@3un/ui'
import {
  ASYNC_ORDER_STATUS,
  debounce,
  downloadURL,
  ORDER_STATUS,
  ORDER_VERIFY, ServiceFieldType, xconfirm
} from '@3un/utils'

import { SUBMIT_STORE } from '../utils'
import { serviceApi, type FieldMap, type Service, type ServiceCols } from '@/api/services'
import { orderApi, type DeleteImeiPrams, type Order, type OrderProgressResp, type OrderSubmitResult, type OrderTableView, type ServiceColumnItem, type SubmitOrderListParams } from '@/api/orders'
import router from '@/router'
import { getSubmitImei, normalizeFilterValue } from '@/utils/common'
import { processedServiceFields } from '../utils/serviceFieldUtils'
import type { DeleteDataItem } from '../utils/types'
// import { userApi } from '@/api/user/index.ts'

const store = inject(SUBMIT_STORE)!

store.onClickHeaderDelete = handleDeleteHeader

const { t, locale } = useI18n()
const serviceStore = useServiceStore()
const uStore = useUserStore()
const { connect, close } = useWsStore()
const iStore = useSystemStore()
const localStore = useLocalStore()
const { copy } = useClipboard({ legacy: true })
const route = useRoute()

const orderTableRef = ref<XTableV2Expose | null>(null)

const disabled = ref(false)
const selService = ref<Service>()
const serviceColumns = ref<ServiceColumnItem[]>([])
const showAll = ref(false)
const submited = ref<boolean>(false)
const tableRef = ref<XTableExpose | null>(null)
const imeis = ref<string[]>([])
const comments = ref<string>('')
const loading = ref(false)
const submitLoading = ref(false)
const threads = ref(5)
const pushMsg = ref(true)
const reseted = ref<boolean>(false)
const exportLoading = ref(false)
const indexes = ref<number[]>([])

const columns = shallowRef<XTableV2Column<OrderTableView>[]>([])

const threadKey = import.meta.env.VITE_THREAD_STORAGE

const btnSplitOpts: XBtnSplitOptions = [
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
// const sizes = [50, 150, 200, 300, 500]
const defaultColumns = await getDefaultColumns()

columns.value = defaultColumns.columns
triggerRef(columns)

let count = 0
let headers: string[] = []
let cacheImei: boolean = false
let pendingOrders: number[] = []
let orderImeis: Record<string, number> = {}
let deletedColumns: XTableV2Column<OrderTableView>[] = []
let lastServiceId: number | undefined = undefined
let isUseStoraged: boolean = false

watch(
  () => route.params,
  async (params) => {
    const id = params.id

    if (isNumeric(id)) {
      store.selectId = +id
      const service = serviceStore.services.get(store.selectId)

      await handleSelected(store.selectId)

      if (service) {
        const imei = params.imei as string
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

watch(
  () => showAll.value,
  async () => {
    if (!selService.value) return
    await handleSubmitOrder(selService.value.id)
  }
)

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

const mustRead = computed(() => {
  const service = serviceStore.services.get(store.selectId!)
  return service ? service.mustRead : null
})

async function getDefaultColumns() {
  const data = await processedServiceFields(0)

  return data
}

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

function getSubmitedRejectOrder() {
  return store.rawOrders.filter(x => x.status === ORDER_STATUS.FAILED && !x.id)
}

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

async function handleImport(imeiList: string[], remark: string) {
  if (!selService.value) return
  if (disabled.value) return toast.warning(localStore.localData['submit_WaitOrder'])
  if (imeiList.length === 0) return
  // if (count > 0 && !selService.value?.isUnlock) return

  tableRef.value?.initFilter()
  close()

  imeis.value = [...
    new Set([
      ...imeis.value,
      ...store.rawOrders
        .filter(x => x.status === ORDER_STATUS.WAIT)
        .map(x => x.imei).filter(x => !!x),
      ...imeiList
    ])
  ]
  // console.log(imeis.value)
  const submitedOrders = processWaitList(store.selectId!, imeis.value, remark)
  store.rawOrders.splice(0, getWaitingOrderLength(store.rawOrders), ...submitedOrders)
  // store.rawOrders = submitedOrders
  // imeis.value = store.rawOrders.map(o => o.imei)
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

function getWaitingOrderLength(rawOrders: OrderTableView[]) {
  const waitProcessOrder = rawOrders.filter(o => o.status === ORDER_STATUS.WAIT)
  return waitProcessOrder.length
}

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
    // store.refreshProgress = !store.refreshProgress
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

function handleCount() {
  count = count - 1

  if (count === 0) {
    disabled.value = false
    return close()
  }
}

function handleExport() {
  let ids = store.rawOrders.map((item) => item.id).filter(item => item !== null && item !== undefined)

  if (indexes.value.length > 0) {
    ids.length = 0
    for (const index of indexes.value) {
      const order = store.rawOrders.find((o) => o.index === index)

      if (order && order.id) {
        ids.push(order.id)
      }
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

  const deleteHeaders = store.serviceCols.filter(item => {
    const name = item.key
    return !store.selectHeaders.includes(name)
  }).map(item => item.key)

  exportLoading.value = true
  const response = orderApi.submitExport({
    serviceId: store.selectId,
    orderIdList: ids,
    excelHead: headers,
    deleteExcelHead: deleteHeaders,
  })

  response.then(({ data }) => downloadURL(data))
  response.finally(() => exportLoading.value = false)
}

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
      // console.log(ex)
    }
  }

  router.replace({ query: {} })

  imeis.value = []
  // store.rawOrders = []
  submited.value = false
  comments.value = ''
  count = 0
  // showAll.value = false
  close()
}

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
  // toast.success(localStore.localData['submit_SuccessFresh'])

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

async function handleMustRead() {
  const result = await xconfirm({
    title: localStore.localData['submit_ServiceDescription'],
    text: mustRead.value || '',
    confirmText: localStore.localData['submit_FieldsDialogConfirm'],
    cancelText: undefined,
  })

  if (!result) pushMsg.value = true
}

async function handlePushMsgChange(value: boolean) {
  if (value) return

  const result = await xconfirm`
    ${localStore.localData['submit_PushResultToast']}
  `
  if (!result) pushMsg.value = true
}

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

function handleSelectedIndex(keys: RowKey[]) {
  if (keys.every(x => typeof x === "number")) {
    indexes.value = keys
  }
}

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

function refreshStatOrders() {
  store.progressData = statRawOrder()
  if (store.rawOrders.length > 0) {
    store.refreshProgress = !store.refreshProgress
    store.visibleGress = true
  }
}

function processHasChange() {
  const service = serviceStore.services.get(store.selectId)
  if (service?.isUnlock || isUseStoraged) {
    handleFresh()
  }
}

const handleThreadChange = debounce(async () => {
  localStorage.setItem(`${threadKey}_${uStore.info.userId}`, threads.value.toString())
  await serviceApi.setThread(threads.value)
})

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

// 停止提交的逻辑
// async function stopSubmit() {
//   try {
//     await serviceApi.stopSubmit()
    
//     submited.value = false
    
//     store.rawOrders.map(item => {
//       if (item.status === ORDER_STATUS.PROCESSING) {
//         item.status = ORDER_STATUS.WAIT
//       }
//       return null
//     }).filter(Boolean)
//   } catch {

//   } finally {
//     setTimeout(() => {
//       uStore.updateCredit()
//     } , 5000)
//   }
// }

// 停止按钮显示与隐藏
// const isShowStopBtn = computed(() => {
//   return store.rawOrders.some(item => item.status === ORDER_STATUS.PROCESSING)
// })

onBeforeUnmount(() => {
  cleanup().finally()
})
</script>

<template>
  <div class="p-4 h-full pb-4 flex flex-col">
    <section class="
        w-full flex items-center justify-between flex-wrap mb-3 space-y-2
      ">
      <div class="flex items-center space-x-2 flex-wrap gap-y-2">
        <SelectService v-model="store.selectId" ui-trigger="w-52" @selected="handleSelected" />

        <ImportPlane :selected-id="store.selectId" @submit="handleImport" />

        <ButtonGroup :labels="{
          submit: localStore.localData['submit_Submit'],
          export: localStore.localData['submit_Export'],
          clear: localStore.localData['submit_Clear'],
        }" :layouts="[
            'submit',
            'export',
            'clear',
          ]" @submit="handleSubmit()"  @export="handleExport" @clear="reset" />

        <XButtonSplit :label="localStore.localData['submit_Reset']" :options="btnSplitOpts" @click="resetSelectRow" />


        <XButton v-if="selService" :label="localStore.localData['submit_QueryResult']" color="warning"
          :disabled="disabled" :loading="loading" @click="handleFresh" />

        <XButton :label="localStore.localData['history_CopyIMEI']" color="success" variant="soft"
          @click="handleCopyImei" />

        <XButton v-show="serviceColumns.length !== 0" variant="soft"
          :label="localStore.localData['submit_FieldsFilter']" color="primary"
          @click="store.visibleHeaderFilter = true" />


        <XButton v-show="mustRead" variant="soft" :label="localStore.localData['submit_ServiceDescription']"
          color="warning" @click="handleMustRead" />

        <XSwitch v-model="pushMsg" :left-label="localStore.localData['submit_PushResult']"
          @change="handlePushMsgChange" />

        <XSwitch v-model="showAll" :left-label="localStore.localData['submit_ShowAll']" v-if="store.selectId"
          @change="count = 0" />

        <label class="flex items-center space-x-2">
          <span>{{ localStore.localData['submit_ThreadCount'] }}</span>
          <XInputNumber v-model="threads" :step="1" :precision="0" :min="1" :max="10" @change="handleThreadChange" />
        </label>
      </div>
    </section>

    <section class="flex-1 min-h-0">
      <XTableV2 ref="orderTableRef" :columns="columns" :data="orders" selection select-key="index"
        @selected="handleSelectedIndex" />
    </section>

    <OrderProgress @changed="processHasChange" />
    <TableColumnDialog @confirm="processHeaderConfirm" />
    <UnlockRecommendDialog />
  </div>
</template>
