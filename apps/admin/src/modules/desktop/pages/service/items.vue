<script setup lang="ts">
import ItemDialog from './components/ItemDialog.vue'
import ItemUpstream from './components/ItemUpstream.vue'

import { isNullish } from '@3un/ui'

import { zServiceForm } from '@/inters/services'
import { getUpstreams } from '@/api/upstream'

import { SERVICE_STORE, type ServiceStore } from './utils'
import { columns } from './utils/columnItem'
import ServiceFieldDialog from './components/ServiceFieldDialog.vue'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const serviceStore = useServiceStore()
const store: ServiceStore = reactive({
  upstreams: [],

  formBase: zServiceForm.parse({}),
  formSearch: { categoryId: null, keyword: '' },
  formUpstream: {
    apiId: undefined,
    serviceId: undefined,
    externalNetworkId: undefined,
  },

  visibleBase: false,
  visibleUpstream: false,
  visibleField: false,

  index: undefined,
})

provide(SERVICE_STORE, store)

const route = useRoute()
const router = useRouter()

const initedColumns = initColumns(columns, ColumnEnum.ServiceItem)

watch(
  () => route.query,
  ({ cid, id }) => {
    store.formSearch = {
      categoryId: cid ? +cid : null,
      keyword: (id as string) || '',
    }
  },
  { immediate: true },
)

const displayItems = computed(() => {
  let items = serviceStore.items
  let { categoryId, keyword } = store.formSearch
  keyword = keyword.trim().toLowerCase()

  if (!isNullish(categoryId)) {
    items = items.filter(item => item.categoryId === categoryId)
  }

  if (keyword) {
    items = items.filter(item =>
      item.tmpTitle.toLowerCase().includes(keyword) ||
      item.packageTitle.toLowerCase().includes(keyword) ||
      item.packageTitleLocal.toLowerCase().includes(keyword) ||
      item.packageId.toString().includes(keyword)
    )
  }

  return items
})

initUpstreams()
async function initUpstreams() {
  const data = await getUpstreams()
  store.upstreams = data
}

function openCreate() {
  store.formBase = zServiceForm.parse({})
  store.index = undefined
  store.visibleBase = true
}

type ClearType = 'category' | 'keyword'
function handleClear(type: ClearType) {
  router.replace({ path: route.path, query: {[type]: undefined}})
}
</script>

<template>
  <div>
    <section class="flex items-center p-3 border-b">
      <XSelect
        v-model="store.formSearch.categoryId"
        clearable ui-trigger="w-56 mr-2"
        placeholder="请选择服务组"
        @clear="handleClear('category')"
      >
        <XSelectItem
          v-for="item in serviceStore.groups"
          :key="item.categoryId"
          :value="item.categoryId"
          :label="item.category"
        />
      </XSelect>

      <XInput
        v-model="store.formSearch.keyword"
        clearable ui-root="w-64"
        placeholder="请输入关键词"
        @clear="handleClear('keyword')"
      />

      <hr class="h-6 w-px mx-4 bg-border" />

      <XButton
        label="新增"
        color="success"
        icon="lucide:circle-plus"
        @click="openCreate"
      />
    </section>

    <div class="p-3 pb-0">
      <XTable
        :data="displayItems"
        :columns="initedColumns"
        class="border h-[calc(100vh-8.75rem)]"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.ServiceItem,
          column.key.toString(),
          width
        )"
      />
    </div>

    <ItemDialog />
    <ItemUpstream />
    <ServiceFieldDialog />
  </div>
</template>
