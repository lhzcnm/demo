<script setup lang="ts">
import UpstreamDialog from './components/UpstreamDialog.vue'
import { zUpstreamForm } from '@/inters/upstream'
import { getUpstreams, deleteUpstreams } from '@/api/upstream'

import { API_TYPE, xconfirm, API_TYPE_LIST } from '@3un/utils'
import { isNullish } from '@3un/ui'

import type { UpstreamStore } from './utils'
import { columns } from './utils/column'
import { UPSTREAM_STORE } from './utils'
import { toast } from 'vue-sonner'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: UpstreamStore = reactive({
  upstreams: await getUpstreams(),

  formBase: zUpstreamForm.parse({}),
  visibleBase: false,

  index: undefined,
  refresh: false,
})

provide(UPSTREAM_STORE, store)

const search = ref('')
const apiType = ref<API_TYPE | undefined>()
const ids = ref<number[]>([])

const initedColumns = initColumns(columns, ColumnEnum.UpstreamApi)

watch(
  () => store.refresh,
  async () => {
    store.upstreams = await getUpstreams()
  }
)

const displayUpstreams = computed(() => {
  const searchValue = search.value.trim().toLowerCase()
  let list = store.upstreams

  if (!isNullish(apiType.value)) {
    list = list.filter(item => item.apiType === apiType.value)
  }

  if (searchValue) {
    list = list.filter(item =>
      item.apiTitle.toLowerCase().includes(searchValue) ||
      item.accountId?.toLowerCase().includes(searchValue) ||
      item.serverUrl.toLowerCase().includes(searchValue) ||
      item.apiKey?.toLowerCase().includes(searchValue)
    )
  }

  return list
})

function openCreate() {
  store.formBase = zUpstreamForm.parse({})
  store.index = undefined
  store.visibleBase = true
}

async function handleDelete() {
  if (ids.value.length === 0) {
    return toast.warning('请选择要删除的API')
  }

  if (await xconfirm('确定要删除这些API吗？')) {
    await deleteUpstreams(ids.value)
    store.upstreams = store.upstreams
      .filter(item => !ids.value.includes(item.apiId))
  }
}
</script>

<template>
  <div>
    <section class="flex items-center p-3 border-b">
      <XSelect
        v-model="apiType"
        placeholder="选择API类型"
        ui-trigger="w-48 mr-2"
        clearable
      >
        <XSelectItem 
          v-for="item in API_TYPE_LIST" :key="item.value"
          :value="item.value" :label="item.label"
        />
      </XSelect>
      <XInput
        v-model="search"
        ui-root="w-64 flex-shrink-0"
        icon="lucide:search"
        placeholder="搜索"
        clearable
      />

      <hr class="h-6 w-px mx-4 bg-border" />

      <XButton
        label="新增API"
        class="mr-2"
        color="success"
        icon="lucide:plus"
        @click="openCreate"
      />
      <XButton
        label="永久删除"
        color="danger"
        icon="lucide:trash"
        @click="handleDelete"
      />
    </section>

    <div class="p-3 pb-0">
      <XTable
        :columns="initedColumns"
        :data="displayUpstreams"
        selection
        row-key="apiId"
        selected-key="apiId"
        class="border h-[calc(100vh-8.75rem)]"
        @select-change="ids = $event"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.UpstreamApi,
          column.key.toString(),
          width
        )"
      />
    </div>

    <UpstreamDialog />
  </div>
</template>
