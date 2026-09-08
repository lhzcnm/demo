<script setup lang="ts">
import type { ServiceCols } from '@/api/services'
import { SUBMIT_STORE } from '../utils'

interface TableColumnDialogEmits {
  (e: 'confirm', headers: ServiceCols[]): void
}

const store = inject(SUBMIT_STORE)!
const localStore = useLocalStore()

const emit = defineEmits<TableColumnDialogEmits>()

/** 当前选中的表头字段列表 */
const filteredHeaders = ref<string[]>([])

/** 所有可用的服务表头字段 */
const serviceHeaders = computed(() => {
  return store.serviceCols.map(item => item.key)
})

/** 是否全部选中 */
const allSelected = computed(() => {
  return (
    serviceHeaders.value.length > 0 &&
    serviceHeaders.value.every(item =>
      filteredHeaders.value.includes(item)
    )
  )
})

/**
 * 监听弹窗显示状态
 * 打开时同步当前已选中的表头
 */
watch(
  () => store.visibleHeaderFilter,
  (visible) => {
    if (visible) {
      filteredHeaders.value = [...store.selectHeaders]
    }
  }
)

/**
 * 切换单个字段的选中状态
 */
function toggleVal(val: string) {
  const idx = filteredHeaders.value.findIndex(v => v === val)
  if (idx !== -1) filteredHeaders.value.splice(idx, 1)
  else filteredHeaders.value.push(val)
}

/**
 * 全选 / 取消全选
 */
function toggleAll(e: Event) {
  const target = e.target as HTMLInputElement

  if (target.checked) {
    serviceHeaders.value.forEach(item => {
      if (!filteredHeaders.value.includes(item)) {
        filteredHeaders.value.push(item)
      }
    })
  } else {
    filteredHeaders.value = filteredHeaders.value.filter(val => !serviceHeaders.value.includes(val))
  }
}

/**
 * 确认选择
 * 更新 store 中的选中表头并触发 confirm 事件
 */
function handleConfirm() {
  store.selectHeaders = [...filteredHeaders.value]

  const headers = store.serviceCols.filter(item => {
    const name = item.key
    return filteredHeaders.value.includes(name)
  })

  emit('confirm', headers)
  store.visibleHeaderFilter = false
}

/**
 * 关闭弹窗
 * 恢复为之前选中的表头
 */
function handleClose() {
  filteredHeaders.value = store.selectHeaders
  store.visibleHeaderFilter = false
}
</script>

<template>
  <XDialog v-model="store.visibleHeaderFilter" :title="localStore.localData['submit_FieldsDialog']"
    @close="handleClose">
    <template #default>
      <div class="filter-modal text-[9px] md:text-[14px]">
        <div class="flex flex-col gap-1 mb-4 max-h-64 overflow-auto">
          <!-- 全选 -->
          <label class="flex items-center gap-2">
            <input type="checkbox" value="all" :checked="allSelected" @change="toggleAll" />
            <span>{{ localStore.localData['submit_FieldsDialogAll'] }}</span>
          </label>

          <!-- 字段列表 -->
          <div class="grid grid-cols-3 space-y-2">
            <label v-for="item in store.serviceCols" :key="item.key" class="flex items-center gap-2">
              <input type="checkbox" :value="item" :checked="filteredHeaders.includes(item.key)"
                @change="toggleVal(item.key)" />
              <span>{{ item.title }}</span>
            </label>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <XButton variant="soft" :label="localStore.localData['submit_FieldsDialogCancel']" @click="handleClose" />
        <XButton :label="localStore.localData['submit_FieldsDialogConfirm']" @click="handleConfirm" />
      </div>
    </template>
  </XDialog>
</template>