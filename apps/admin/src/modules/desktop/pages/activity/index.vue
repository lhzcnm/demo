<script setup lang="ts">
import ActivitySearchDialog from './components/ActivitySearchDialog.vue'
import ActivityDialog from './components/ActivityDialog.vue'
import ActivityRuleDialog from './components/ActivityRuleDialog.vue'

import { zActivityForm, zActivitySearch, type ActivitySearch } from '@/inters/activity'
import { ACTIVITY_STORE, type ActivityStore } from './utils'
import { getActivitys } from '@/api/activity'
import { columns } from "./utils/columnActivity"
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: ActivityStore = reactive({
  visibleBase: false,
  visibleSearch: false,
  visibleRule: false,

  activities: [],
  formSearch: zActivitySearch.parse({}),
  formBase: zActivityForm.parse({}),

  activityRules: [],
  activityRuleForms: [],

  refresh: false,
  index: undefined,
})

provide(ACTIVITY_STORE, store)

const loading = ref<boolean>(false)

const initedColumns = initColumns(columns, ColumnEnum.Activity)

watch(
  [
    () => store.refresh,
  ],
  async () => {
    await getList(store.formSearch)
  },
  {
    immediate: true,
  }
)

async function getList(params: ActivitySearch) {
  try {
    loading.value = true
    store.activities = await getActivitys(params)
  } catch {} finally {
    loading.value = false
  }
}

function resetSearch() {
  store.formSearch = zActivitySearch.parse({})
  store.refresh = !store.refresh
}

function openCreate() {
  store.index = undefined
  store.formBase = zActivityForm.parse({})
  store.visibleBase = true
}
</script>

<template>
  <div>
    <section class="flex p-3 border-b">
      <div class="flex items-center gap-2">
        <XButton
          icon="lucide:filter"
          label="筛选"
          @click="store.visibleSearch = true"
        />

        <XButton
          label="清空筛选"
          variant="outline"
          icon="lucide:brush-cleaning"
          @click="resetSearch"
        />

        <hr class="h-full w-px mx-4 bg-border">

        <XButton
          label="新增活动"
          color="success"
          icon="lucide:plus"
          @click="openCreate"
        />
      </div>
    </section>

    <div class="p-3 pb-0">
      <XTable
        :columns="initedColumns"
        :data="store.activities"
        :loading="loading"
        class="border h-[calc(100vh-8.75rem)]"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.Activity,
          column.key.toString(),
          width
        )"
      />
    </div>

    <ActivitySearchDialog />
    <ActivityDialog />

    <ActivityRuleDialog />
  </div>
</template>
