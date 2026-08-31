<script setup lang="ts">
import ImgOrder from '../components/ImgOrder.vue'
import ExportOrder from '../components/ExportOrder.vue'
import SearchOrder from '../components/SearchOrder.vue'
import PrintDialog from '../components/PrintDialog.vue'
import OrderVoucher from '@/components/shared/OrderVoucher.vue'
import OrderExportImgZh from '@/components/shared/OrderExportImgZh.vue'
import OrderExportImgEn from '@/components/shared/OrderExportImgEn.vue'
import UnlockRecommendDialog from '../components/UnlockRecommendDialog.vue'

import { toast } from 'vue-sonner'
import { useClipboard } from '@vueuse/core'
import { downloadURL, ORDER_STATUS } from '@3un/utils'
import * as html2image from 'html-to-image'
import type { XTableExpose } from '@3un/ui'
import { h, render } from 'vue'

import { form, formatOrderParams, HISTORY_STORE } from '../utils'
import { getOrderColumns } from '../utils/columns'
import { orderApi, type Order, type OrderExportParams, type OrderPrintParams } from '@/api/orders'
import type { ImgOrderItem } from '../types'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store = inject(HISTORY_STORE)!

const { copy } = useClipboard({ legacy: true })
const { locale } = useI18n()
const localStore = useLocalStore()

const page = ref(1)
const limit = ref(20)
const selectRows = ref<number[]>([])
const generated = ref<boolean>(false)
const loading = ref(false)

const imgOrders = reactive<ImgOrderItem[]>([])

const tableRef = ref<XTableExpose | null>(null)

const initedColumns = initColumns(getOrderColumns(), ColumnEnum.Order)

watch(
  [page, limit],
  async ([pageVal, pageSizeVal]) => {
    tableRef.value?.scrollToTop()
    loading.value = true

    const params = formatOrderParams(store.searchForm)
    const response = await orderApi.list({
      pageSize: pageSizeVal,
      page: pageVal,
      ...params,
    })
    store.orders = response.data
    loading.value = false
  },
  { immediate: true }
)

function openSearch() {
  store.visibleSearch = true
}

function openExport() {
  if(selectRows.value.length > 0 && isSameService(selectRows.value)) {
    const index = store.orders.list.findIndex(o => o.id === selectRows.value[0])
    if (index !== -1) {
      const order = store.orders.list[index]
      handleExport(order.serviceId, selectRows.value.map(i => i.toString()))
      return
    }
  }

  store.exportForm = { ...form.export }
  store.visibleExport = true
}

function isSameService(orderIds: number[]) {
  if (store.orders.total === 0) return false
  const idSet = new Set(orderIds)
  const selectOrders = store.orders.list.filter(o => idSet.has(o.id))
  const firstOrder = selectOrders[0]

  return selectOrders.every(o => o.serviceId === firstOrder.serviceId)
}

function handleExport(serviceId: number, orderIds: string[]) {
  const params: OrderExportParams = {
    serviceId: serviceId,
    orderIdList: orderIds,
  }
  orderApi.export(params).then(({ data }) => {
    downloadURL(data)
  })
}

function handleCopy() {
  if (selectRows.value.length === 0) {
    toast.warning(localStore.localData['history_SelectOrder_Toast'])
    return
  }

  const res: string[] = []

  for(let id of selectRows.value) {
    const order = store.orders.list.find(item => item.id === +id)!
    res.push(order.imei)
  }

  copy(res.join('\n'))
  toast.success(localStore.localData['history_Copied_Toast'])
}

function handleClose() {
  store.visibleOrderImg = false

  for(const order of imgOrders) {
    URL.revokeObjectURL(order.img)
  }
}

function openPrint() {
  if(selectRows.value.length === 0) {
    return toast.warning(localStore.localData['history_SelectOrder_Toast'])
  }
  if (!validServiceUnique(selectRows.value)) {
    return toast.warning(localStore.localData['history_CannotPrints_Toast'])
  }

  store.selectOrders = getOrdersyId(selectRows.value)

  if (store.selectOrders.length === 0) {
    return toast.warning(localStore.localData['history_ProcessingAndFail_Toast'])
  }
  store.views = 'print'
}

function validServiceUnique(ids: number[]) {
  const selectedOrders = store.orders.list.filter(o => ids.includes(o.id))
  const lastServiceId = selectedOrders[selectedOrders.length - 1].serviceId

  return selectedOrders.every(o => o.serviceId === lastServiceId)
}

function getOrdersyId(ids: number[]) {
  return store.orders.list
    .filter(o => o.status === ORDER_STATUS.SUCCESS)
    .filter(o => ids.includes(o.id))
}

function handleGenerate() {
  handleClose()
  imgOrders.length = 0

  if(selectRows.value.length === 0) {
    toast.warning(localStore.localData['history_SelectOrder_Toast'])
    return
  }

  const orders: Order[] = []
  generated.value = true

  for(let id of selectRows.value) {
    const order = store.orders.list.find(item => item.id === +id)!
    orders.push(order)
  }

  for(let order of orders) {
    if(order.status === ORDER_STATUS.FAILED) {
      continue
    }
    
    const container = document.createElement('div')
    document.body.append(container)
    // container.className = `opacity-0 flex`
    container.className = `flex`

    const vnode = h(OrderVoucher, { order, component: locale.value === 'zh' ? OrderExportImgZh : OrderExportImgEn })

    render(vnode, container)

    const dom = document.getElementById(`order${order.id}`)!

    html2image.toBlob(dom, {
      cacheBust: true,
      skipFonts: true,
    }).then((blob: Blob | null) => {
      const url = URL.createObjectURL(blob!)
      imgOrders.push({
        id: order.id,
        imei: order.imei,
        img: url,
      })
    }).finally(() => {
      store.visibleOrderImg = true
      render(null, container)
      container.remove()
      generated.value = false
    })
  }
}

async function submitPrint() {
  const body: OrderPrintParams = {
    result: [],
    labelWidth: store.paperSize.labelWidth,
    labelHeight: store.paperSize.labelHeight,
  }

  for(const id of selectRows.value) {
    const filters = store.orders.list.filter(item => item.id === +id).map(item => item.result)
    body.result.push(...filters)
  }

  try {
    const { data } = await orderApi.orderPrint(body)
  
    const blob = new Blob([data], { type: 'application/pdf' })
    const pdfUrl = URL.createObjectURL(blob)
    handleOpenWindow(pdfUrl)

  } catch(e) {
    console.error(e)
  }
}

function handleOpenWindow(url: string) {
  const openWindow = window.open(url, '_blank')
    openWindow!.onload = () => {
      try {
        setTimeout(() => {
          openWindow!.print()
          openWindow!.onbeforeunload = () => {
            URL.revokeObjectURL(url)
          }
        }, 1000)
      } catch (err) {
        URL.revokeObjectURL(url)
      }
    }
}

onUnmounted(() => {
  handleClose()
})
</script>

<template>
  <div class="p-4 h-full">
    <section class="flex justify-between flex-wrap space-x-2 mb-3 gap-y-2">
      <div class="space-x-2 whitespace-nowrap flex flex-wrap gap-y-2">
        <ButtonGroup
          :layouts="['filter', 'export']"
          :labels="{filter: localStore.localData['history_Filter'],export: localStore.localData['history_Export']}"
          @filter="openSearch" @export="openExport"
        />
        <XButton color="warning" :label="localStore.localData['history_PrintResult']" @click="openPrint" />
        <XButton variant="soft" :label="localStore.localData['history_CopyIMEI']" @click="handleCopy" />
        <XButton variant="soft" color="success" :label="localStore.localData['history_GenerateImages']" :disabled="generated" @click="handleGenerate" />
      </div>

      <XPagination
        v-model="page"
        v-model:limit="limit"
        :total="store.orders.total"
        class="flex-wrap gap-y-2"
        :layouts="[
          'total',
          'prev',
          'pager',
          'next',
          'sizes',
          'jumper',
        ]"
      />
    </section>

    <XTable
      ref="tableRef"
      :data="store.orders.list"
      :columns="initedColumns"
      :loading="loading"
      row-key="id"
      selected-key="id" selection
      class="h-[calc(100%-3rem)] border"
      @select-change="selectRows = $event"
      @column-resize="(column, width) => storageColumn(
        ColumnEnum.Order,
        column.key.toString(),
        width
      )"
    />

    <SearchOrder />
    <ExportOrder />
    <ImgOrder :imgOrders="imgOrders" @close="handleClose" />
    <PrintDialog @confirm="submitPrint" />
    <UnlockRecommendDialog />
  </div>
</template>
