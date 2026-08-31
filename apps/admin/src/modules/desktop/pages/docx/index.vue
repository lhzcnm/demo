<script setup lang="ts">
import { toast } from 'vue-sonner'
import ImageDialog from './component/ImageDialog.vue'
import { DOCX_STORE, type DocxStore } from './utils'
import { columns } from './utils/column'
import { DeleteIllustrate } from '@/api/illustrate.ts'
import { xconfirm } from '@3un/utils'
import { zIllustrateForm } from '@/inters/illustrate/index.ts'
import IllustrateDialog from './component/IllustrateDialog.vue'
import IllustrateConfirm from './component/IllustrateConfirm.vue'
import { ColumnEnum, initColumns, storageColumn } from '@/utils/column.ts'

const store = reactive<DocxStore>({
  docxImageMap: new Map(),

  visibleImage: false,
  visibleBase: false,

  formBase: zIllustrateForm.parse({}),

  index: undefined,
  refresh: false,
})

provide(DOCX_STORE, store)

const iStore = useSystemStore()

const selectCodes = ref<string[]>([])
const loading = ref<boolean>(false)

const initedColumns = initColumns(columns, ColumnEnum.Docx)

watch(
  () => store.refresh,
  async () => {
    loading.value = true
    await iStore.getIllustrateList()
    loading.value = false
  }
)

await iStore.getIllustrateList()

async function handleDeleteClick() {
  if (selectCodes.value.length === 0) {
    toast.warning('请选择需要删除的数据')
    return
  }

  if (await xconfirm('是否确认删除这些数据')) {
    await DeleteIllustrate(selectCodes.value)
    store.refresh = !store.refresh
  }
}

function openCreate() {
  store.index = undefined
  store.formBase = zIllustrateForm.parse({})
  store.visibleBase = true
}
</script>

<template>
  <div>
    <section class="flex justify-between p-3 border-b">
      <div class="flex gap-2">
        <XButton
          label="添加"
          color="success"
          icon="lucide:cross"
          @click="openCreate"
        />
        <XButton
          label="删除说明文档"
          color="danger"
          icon="lucide:trash-2"
          @click="handleDeleteClick"
        />
      </div>
    </section>

    <div class="p-3 pb-0">
      <XTable
        ref="tableRef"
        :columns="initedColumns"
        :data="iStore.illustrateList"
        selection
        :loading
        selected-key="serviceCode"
        class="border h-[calc(100vh-8.75rem)]"
        @select-change="selectCodes = $event"
        @column-resize="(column, width) => storageColumn(
          ColumnEnum.Docx,
          column.key.toString(),
          width
        )"
      />
    </div>

    <IllustrateConfirm />
    <IllustrateDialog />
    <ImageDialog />
  </div>
</template>
