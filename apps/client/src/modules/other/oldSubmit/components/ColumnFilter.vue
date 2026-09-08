<script setup lang="ts">
import { SUBMIT_STORE } from '../utils'
import type { XTableV2Column } from '@3un/ui'
import type { OrderTableView } from '@/api/orders'
import { Icon } from '@iconify/vue'
import { normalizeFilterValue } from '@/utils'

interface ColumnFilterProps {
  col: XTableV2Column<OrderTableView>
}

const props = defineProps<ColumnFilterProps>()

const store = inject(SUBMIT_STORE)!
const visible = ref<boolean>(false)
const filterOptions = shallowRef<string[]>([])
const countMap: Record<string, number> = {}

/**
 * 监听原始订单数据变化
 * 数据变化时重新计算筛选选项
 */
watch(
  () => store.rawOrders,
  () => {
    handleCountMap()
    handleVisibleFilters()
  },
  { deep: true }
)

/**
 * 是否全部选中
 */
const allSelected = computed(() => (
  filterOptions.value.every(val => store.visibleFilters[props.col.key].includes(val))
))

/**
 * 统计各选项数量
 * 构建筛选选项列表
 */
function handleCountMap() {
  const key = props.col.key

  const map: Record<string, number> = {}

  store.rawOrders.forEach(row => {
    const val = normalizeFilterValue(row[key])
    map[val] = (map[val] ?? 0) + 1
  })
  Object.keys(countMap).forEach(x => delete countMap[x])

  Object.assign(countMap, map)

  if (!(key in store.visibleFilters)) {
    store.visibleFilters[key] = Object.keys(countMap)
  } else if (!store.userChangedFilters[key]) {
    store.visibleFilters[key] = Object.keys(countMap)
  }

  if (store.popoverVisible[key] === undefined) {
    store.popoverVisible[key] = false
  }

  if (!(key in store.filterData)) {
    store.filterData[key] = ""
  }

  filterOptions.value = Object.keys(countMap)
    .filter(x => x.includes(store.filterData[key]))
}

/**
 * 切换单个筛选选项
 */
function toggleStatus(val: string) {
  store.userChangedFilters[props.col.key] = true

  const arr = store.visibleFilters[props.col.key]

  const idx = arr.findIndex(v => v === val)

  if (idx >= 0) {
    arr.splice(idx, 1)
  } else {
    arr.push(val)
  }
}

/**
 * 全选 / 取消全选
 */
function handleSelectAll(e: Event) {
  const target = e.target as HTMLInputElement
  const key = props.col.key

  store.userChangedFilters[key] = true

  if (target.checked) {
    const set = new Set(store.visibleFilters[key])

    filterOptions.value.forEach(val => {
      set.add(val)
    })

    store.visibleFilters[key] = Array.from(set)
  } else {
    store.visibleFilters[key] =
      store.visibleFilters[key].filter(
        val => !filterOptions.value.includes(val)
      )
  }
}

/**
 * 处理可见筛选选项
 * 同步新增数据的筛选状态
 */
function handleVisibleFilters() {
  const keys = Object.keys(store.visibleFilters)
  Object.entries(store.rawOrders).forEach(([key, value]) => {
    if (keys.includes(key)) {
      const val = normalizeFilterValue(value)
      store.visibleFilters[key] = Array.from(new Set([...store.visibleFilters[key], val]))
    }
  })
}
</script>

<template>
  <XPopover
    v-model="visible"
    :close-on-click-outside="true"
  >
    <!-- 触发按钮 -->
    <template #trigger>
      <button
        class="pr-2 opacity-0 group-hover:opacity-100 transition-opacity"
        @click="visible = true"
      >
        <Icon icon="lucide:filter" />
      </button>
    </template>

    <!-- 筛选面板 -->
    <template #default>
      <div class="p-2 flex flex-col space-y-2 max-h-60 overflow-auto">
        <!-- 全选 + 搜索 -->
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            :checked="allSelected"
            @change="handleSelectAll"
          />

          <XInput
            v-model="store.filterData[col.key]"
            placeholder="filter"
          />
        </div>

        <!-- 选项列表 -->
        <label
          v-for="val in filterOptions"
          :key="val"
          class="flex items-center space-x-2"
        >
          <input
            type="checkbox"
            :checked="store.visibleFilters[col.key].includes(val)"
            @change="toggleStatus(val)"
          />

          <span
            v-html="`${val === '' ? '(空)' : val} (${countMap[val]})`"
          />
        </label>
      </div>
    </template>
  </XPopover>
</template>