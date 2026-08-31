<script setup lang="ts">
import ActivityRechargeSearch from './components/ActivityRechargeSearch.vue'
import ActivityRechargeDialog from './components/ActivityRechargeDialog.vue'

import { zRechargeSearchForm, type RechargeListParams } from '@/inters/recharge'
import { ACTIVITY_RECHARGE_STORE, type ActivityRecharge } from './utils'
import { getActivitys, getActivyRecharges } from '@/api/activity'
import type { Activity } from '@/inters/activity'
import { createList, defaultPageSize, pageSizes } from '@/utils'
import { columns } from "./utils/columnRecharge"
import type { XTableExpose } from '@3un/ui'
import { zActivyRecharge } from '@/inters/activity/recharge'
import { zActivyVoucherForm } from '@/inters/voucher/activity'
import { deleteRecharges } from '@/api/recharge'
import { toast } from 'vue-sonner'
import { ACTIVITY_STATUS, xconfirm } from '@3un/utils'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: ActivityRecharge = reactive({
  visibleCreate: false,
  visibleSearch: false,

  activityId: 0,

  formSearch: zRechargeSearchForm.parse({}),

  activityMap: new Map<number, Activity>(),

  recharges: createList(),
  formCreate: zActivyVoucherForm.parse({}),
  payment: zActivyRecharge.parse({}),

  refresh: false,
  page: 1,
  limit: defaultPageSize,
})

provide(ACTIVITY_RECHARGE_STORE, store)

const loading = ref<boolean>(false)
const tableRef = ref<XTableExpose | null>(null)
const ids = ref<number[]>([])

const initedColumns = initColumns(columns, ColumnEnum.ActivityRecharge)

watch(
  [
    () => store.page,
    () => store.limit,
    () => store.refresh,
  ],
  async ([pageVal, limitVal]) => {
    await getRechargeList({
      ...store.formSearch,
      page: pageVal,
      pageSize: limitVal,
    })
  }
)

watch(
  () => store.activityId,
  (val) => {
    if (!store.activityMap.has(val)) return
    const data = store.activityMap.get(val)!

    store.formSearch.startTime = data.startTime
    store.formSearch.endTime = data.endTime
    store.page = 1
    store.refresh = !store.refresh
  }
)

async function getActivityList() {
  try {
    const data = await getActivitys({
      status: ACTIVITY_STATUS.ENABLE,
    })
    handleActivitys(data)

    if (data.length > 0) {
      store.activityId = data[0].id
    }
  } catch {  }
}

function handleActivitys(data: Activity[]) {
  for (let item of data) {
    store.activityMap.set(item.id, item)
  }
}

async function getRechargeList(params: RechargeListParams) {
  try {
    loading.value = true
    const data = await getActivyRecharges(params)
    store.recharges = data
    tableRef.value?.scrollToTop()
  } catch {} finally {
    loading.value = false
  }
}

async function batchDeleteRecord() {
  if (!await xconfirm("是否确认删除这些记录?")) return
  try {
    await deleteRecharges(ids.value)
    toast.success("删除成功")
    store.refresh = !store.refresh
  } catch {  }
}

function openSearch() {
  store.visibleSearch = true
}

await getActivityList()
</script>

<template>
  <div>
    <section class="flex justify-between p-3 border-b">
      <div class="flex items-center gap-2">
        <XSelect
          v-model="store.activityId"
          ui-trigger="w-64"
          placement="top-start"
        >
          <XSelectItem
            v-for="([key, value]) in store.activityMap" :key="key"
            :value="key" :label="value.name"
            ui-root="group relative"
          >
            <template #default>
              <div class="relative flex flex-col items-center">
                <button class="px-3 py-2 w-full text-left rounded flex flex-col justify-end">
                  <span>{{ value.name }}</span>
                  <span class="text-sm">{{ value.startTime }} - {{ value.endTime }}</span>
                </button>
              </div>
            </template>
          </XSelectItem>
        </XSelect>
        <XButton
          label="筛选"
          icon="lucide:filter"
          @click="openSearch"
        />
        <XButton
          label="请空筛选"
          variant="outline"
          icon="lucide:x"
        />

        <hr class="h-full w-px border" />

        <XButton
          label="批量删除"
          color="danger"
          icon="lucide:trash-2"
          @click="batchDeleteRecord"
        />
      </div>

      <XPagination
        v-model="store.page"
        v-model:limit="store.limit"
        :total="store.recharges.total"
        :sizes="pageSizes"
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

    <div class="p-3 pb-0">
      <XTable
        ref="tableRef"
        :columns="initedColumns"
        :data="store.recharges.list"
        :loading="loading"
        selection
        selected-key="paymentId"
        class="border h-[calc(100vh-8.75rem)]"
        @select-change="ids = $event"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.ActivityRecharge,
          column.key.toString(),
          width
        )"
      />
    </div>

    <ActivityRechargeDialog />
    <ActivityRechargeSearch />
  </div>
</template>
