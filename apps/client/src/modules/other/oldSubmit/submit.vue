<script setup lang="ts">
import SubmitView from './views/submitView.vue'

import { ASYNC_ORDER_STATUS, ORDER_STATUS, ORDER_VERIFY } from '@3un/utils'
import { type Component } from 'vue'

import type { Service } from '@/api/services'
import type { OrderTableView } from '@/api/orders'
import { orderApi, type ServiceColumnItem } from '@/api/orders'
import { defaultGress, SUBMIT_STORE, type SubmitStore } from './utils/index.ts'

interface TheProps {
  id: string
  imei: string
}

const store = reactive<SubmitStore>({
  visibleHeaderFilter: false,
  visibleUnlockRecommend: false,
  visibleGress: false,
  
  selectHeaders: [],
  serviceCols: [],
  rawOrders: [],
  progressData: defaultGress,

  selectId: 0,
  selectOrderId: undefined,
  view: 'submit',

  refreshProgress: false,
  
  filterData: {},
  visibleFilters: {},
  popoverVisible: {},
  userChangedFilters: {},
})

provide(SUBMIT_STORE, store)

const props = defineProps<TheProps>()

const serviceStore = useServiceStore()
const { locale } = useI18n()

let count = 0
const submited = ref<boolean>(false)
const imeis = ref<string[]>([])
const comments = ref<string>('')

const selService = ref<Service>()
const serviceColumns = ref<ServiceColumnItem[]>([])

let cacheImei: boolean = false

selService.value = serviceStore.services.get(+props.id)

watch(
  () => props.id,
  () => {
    if (props.id) {
      store.selectId = +props.id
    }
  },
  {
    immediate: true,
  }
)

// Initialize
await Promise.all([
  serviceStore.getServices(),
])

if (props.imei) {
  handleImport([props.imei], '')
}

async function handleImport(imeiList: string[], remark: string) {
  if (!selService.value) return
  if (count > 0 && !selService.value?.isUnlock) return

  if (!cacheImei) {
    await orderApi.cacheImei({ imeiList, serviceId: selService.value.id })
  }

  const submitedOrders = processWaitList(store.selectId!, imeiList, remark)

  store.rawOrders.splice(0, 0, ...submitedOrders)
  submited.value = false
  imeis.value = imeiList
  comments.value = remark
  count = imeiList.length
  cacheImei = false
}

function processWaitList(id: number, imeiList: string[], remark: string) {
  const service = serviceStore.services.get(id)
  const buckets: OrderTableView[] = []
  const isEn = locale.value === "en"

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
    }

    serviceColumns.value.forEach(item => {
      const name = isEn ? item.nameEn : item.name
      initData[name!] = ""
    })

    buckets.push(initData)
  }

  return buckets
}

const components: Record<string, Component> = {
  submit: SubmitView,
}
</script>

<template>
  <Transition name="fade-in">
    <component :is="components[store.view]" />
  </Transition>
</template>
