<script setup lang="ts">
import InterceptForm from './components/InterceptDialog.vue'
import { zInterceptForm } from '@/inters/intercept'
import { getIntercepts } from '@/api/intercept'

import type { InterceptStore } from './utils'
import { columns } from './utils/column'
import { INTERCEPT_STORE } from './utils'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store: InterceptStore = reactive({
  intercepts: await getIntercepts(),

  formBase: zInterceptForm.parse({}),
  visibleBase: false,

  index: undefined,
})

provide(INTERCEPT_STORE, store)

const initedColumns = initColumns(columns, ColumnEnum.Intercept)

function openCreate() {
  store.formBase = zInterceptForm.parse({})
  store.index = undefined
  store.visibleBase = true
}
</script>

<template>
  <div>
    <section class="p-3 border-b">
      <XButton
        color="success" icon="lucide:plus"
        label="新增拦截" @click="openCreate"
      />
    </section>

    <div class="p-3 pb-0">
      <XTable
        :columns="initedColumns"
        :data="store.intercepts"
        row-key="id"
        class="border h-[calc(100vh-8.75rem)]"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.Intercept,
          column.key.toString(),
          width
        )"
      />
    </div>

    <InterceptForm />
  </div>
</template>
