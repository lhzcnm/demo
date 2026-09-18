<script setup lang="ts">
import type { CSSProperties } from "vue"
import { type RowKey, type XTableV2Column, type XTableV2Emits, type XTableV2Expose, type XTableV2Props, type XTableV2Slots } from "./helper"
import { style } from "./_style"

defineOptions({ name: "XTableV2" })

const props = withDefaults(
  defineProps<XTableV2Props>(),
  {
    overscan: 6,
    showHeader: true,
    striped: true,
    bordered: true,
    itemHeight: 40,
    autoScroll: false,
    selection: false,
  }
)

type RowType = typeof props.data[number]

const emits = defineEmits<XTableV2Emits>()
const slots = defineSlots<XTableV2Slots<RowType>>()

const tableRef = ref<HTMLDivElement | null>(null)
const bodyRef = ref<HTMLDivElement | null>(null)

const scrollTop = ref(0)
const rowHeights = ref<number[]>([])
const selectedKeys = ref<Set<RowKey>>(new Set())
const columnWidths = ref<Record<string, number>>({})
const tableResizeObserver = ref<ResizeObserver | null>(null)
const dragColumns = ref<Set<string>>(new Set())

let autoScrollTimer: ReturnType<typeof setInterval> | null = null

let dragColumn: string | null = null
let startX = 0
let startWidth = 0

watch(
  () => props.data,
  (val) => {
    if (val.length > 0 && props.autoScroll && !autoScrollTimer) {
      stopAutoScroll()
      startAutoScroll()
    }
    initCheckedRows()
  },
  {
    deep: true,
  }
)

const prefixHeights = computed(() => {
  const arr: number[] = [0]
  for (let i = 0; i < rowHeights.value.length; i++) {
    arr[i + 1] = arr[i] + (rowHeights.value[i] || props.itemHeight)
  }
  return arr
})

const total = computed(() => props.data.length)
const totalHeight = computed(() => prefixHeights.value[total.value] || 0)

function getStartIndex(scrollTop: number) {
  let low = 0
  let high = prefixHeights.value.length - 1

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (prefixHeights.value[mid] <= scrollTop) low = mid + 1
    else high = mid
  }
  return Math.max(0, low - 1)
}

const startIndex = computed(() => getStartIndex(scrollTop.value))
const endIndex = computed(() => {
  const viewHeight = bodyRef.value?.clientHeight || 0
  let i = startIndex.value
  while (i < total.value && prefixHeights.value[i] < scrollTop.value + viewHeight) {
    i++
  }
  return Math.min(total.value, i + props.overscan)
})

const visibleData = computed(() => props.data.slice(startIndex.value, endIndex.value))

const tableColsStyle = computed<CSSProperties[]>(() => {
  return props.columns.map((c) => {
    return {
      width: c.width ?? "auto",
      minWidth: c.minWidth ?? (c.width ?? 100),
      textAlign: c.align ?? "left"
    }
  })
})

const isAllSelected = computed(() => {
  if (!props.selectKey || props.data.length === 0) return false

  return props.data.every((row) => {
    const key = getRowKey(row)
    return key && selectedKeys.value.has(key)
  })
})

const gridTemplateColumns = computed(() => {
  return [
    props.selection ? "40px" : null,
    ...props.columns.map(col => {
      if (dragColumns.value.has(col.key)) {
        return `${columnWidths.value[col.key]}px`
      }

      if (col.flex && typeof col.width === "number") {
        return `minmax(${col.width}px, 1fr)`
      }

      if (typeof col.width === "number") {
        return `${col.width}px`
      }

      return "auto"
    })
  ]
    .filter(Boolean)
    .join(" ")
})

const observers = new Map<number, ResizeObserver>()

function initColumnWidths() {
  nextTick(() => {
    props.columns.forEach(col => {
      columnWidths.value[col.key] =
        getColumnElementWidth(col.key)
    })
  })
}

function observeRow(el: Element | ComponentPublicInstance | null, index: number) {
  if (!el) return

  const dom = (el as ComponentPublicInstance).$el
    ? (el as ComponentPublicInstance).$el as HTMLElement
    : (el as HTMLElement)

  rowHeights.value[index] = dom.offsetHeight

  if (observers.has(index)) return

  const ro = new ResizeObserver(() => {
    rowHeights.value[index] = dom.offsetHeight
  })
  ro.observe(dom)
  observers.set(index, ro)
}

function onScroll(e: Event) {
  const el = e.target as HTMLDivElement
  scrollTop.value = el.scrollTop
  emits("scroll", e)
}

function onBodyScroll(e: Event) {
  onScroll(e)
  const el = e.target as HTMLDivElement
  const header = tableRef.value?.querySelector(".x-vtheader") as HTMLDivElement | null
  if (header) header.scrollLeft = el.scrollLeft
}

function refresh() {
  const top = bodyRef.value?.scrollTop ?? 0

  nextTick(() => {
    requestAnimationFrame(() => {
      rowHeights.value = new Array(props.data.length).fill(props.itemHeight)
      scrollTop.value = top
    })
  })
}

function startAutoScroll() {
  if (!bodyRef.value) return

  if (autoScrollTimer) {
    clearInterval(autoScrollTimer)
    autoScrollTimer = null
  }

  autoScrollTimer = setInterval(() => {
    if (!bodyRef.value) return

    const curScrollTop = bodyRef.value.scrollTop
    const maxScrollHeight = totalHeight.value - (bodyRef.value.clientHeight || 0)

    if (curScrollTop >= maxScrollHeight) {
      bodyRef.value.scrollTop = 0
    } else {
      const scrollStep = 40
      bodyRef.value.scrollTop = curScrollTop + scrollStep
    }
  }, 1500)
}

function stopAutoScroll() {
  if (autoScrollTimer) {
    clearInterval(autoScrollTimer)
    autoScrollTimer = null
  }
  if (bodyRef.value) {
    bodyRef.value.scrollTop = 0
  }
}

function scrollToTop() {
  bodyRef.value?.scroll({
    top: 0,
    behavior: 'smooth',
  })
}

function getRowKey(row: RowType): RowKey | undefined {
  if (!props.selectKey) return

  return row[props.selectKey] as RowKey
}

function toggleRow(row: RowType) {
  const key = getRowKey(row)
  if (!key) return

  if (selectedKeys.value.has(key)) {
    selectedKeys.value.delete(key)
  } else {
    selectedKeys.value.add(key)
  }

  emits('selected', [...selectedKeys.value])
}

function isRowSelected(row: RowType) {
  const key = getRowKey(row)

  return key !== undefined && selectedKeys.value.has(key)
}

function toggleAll() {
  if (!props.selectKey) return

  if (isAllSelected.value) {
    selectedKeys.value.clear()
  } else {
    props.data.forEach((row) => {
      const key = getRowKey(row)
      if (key !== undefined) selectedKeys.value.add(key)
    })
  }

  emits('selected', [...selectedKeys.value])
}

function initCheckedRows() {
  selectedKeys.value.clear()
}

function startResize(
  e: MouseEvent,
  col: XTableV2Column<RowType>
) {
  if (!col.isDrag) return
  dragColumn = col.key
  startX = e.clientX

  startWidth =
    getColumnElementWidth(col.key)

  document.addEventListener(
    "mousemove",
    onResize
  )

  document.addEventListener(
    "mouseup",
    stopResize
  )

  e.preventDefault()
}

function onResize(e: MouseEvent) {
  if (!dragColumn) return

  document.body.style.userSelect = "none"

  const diff = e.clientX - startX
  const col = props.columns.find(
    c => c.key === dragColumn
  )

  if (!col) return

  const minWidth =
    typeof col.minWidth === "number"
      ? col.minWidth
      : 40

  columnWidths.value[dragColumn] =
    Math.max(
      minWidth,
      startWidth + diff
    )

  dragColumns.value.add(dragColumn)
}

function stopResize() {
  dragColumn = null

  document.body.style.userSelect = ""

  document.removeEventListener(
    "mousemove",
    onResize
  )

  document.removeEventListener(
    "mouseup",
    stopResize
  )
}

function getColumnElementWidth(key: string) {
  const header = tableRef.value?.querySelector(
    `[data-column-key="${key}"]`
  ) as HTMLElement | null

  return header?.getBoundingClientRect().width ?? 100
}

defineExpose<XTableV2Expose>({
  refresh: refresh,
  scrollToTop: scrollToTop,
  initCheckedRows: initCheckedRows,
})

const b = style()

onMounted(() => {
  initColumnWidths()

  rowHeights.value = new Array(props.data.length)
    .fill(props.itemHeight)

  if (bodyRef.value) {
    scrollTop.value = bodyRef.value.scrollTop
  }

  if (tableRef.value) {
    tableResizeObserver.value = new ResizeObserver(() => {
      nextTick(() => {
        refresh()
      })
    })

    tableResizeObserver.value.observe(tableRef.value)
  }
})

onUnmounted(() => {
  tableResizeObserver.value?.disconnect()

  observers.forEach((ro) => ro.disconnect())
  observers.clear()

  stopAutoScroll()
})
</script>

<template>
  <div ref="tableWrapper" class="w-full h-full overflow-x-auto">
    <div ref="tableRef" :class="b.base({ bordered: bordered, class: uiRoot })">
      <div v-if="showHeader" class="grid x-vtheader flex-none" :style="{ gridTemplateColumns: gridTemplateColumns }">
        <template v-if="selection">
          <div :class="b.header({ class: uiHeader })">
            <input type="checkbox" :checked="isAllSelected" @change="toggleAll">
          </div>
        </template>

        <div
          v-for="(col, i) in columns"
          :key="col.key"
          class="relative"
          :data-column-key="col.key"
          :class="b.header({ class: uiHeader, isGroup: col.isGroup })"
          :style="tableColsStyle[i]"
        >
          <template v-if="col.headerRender">
            <component :is="col.headerRender(col, data.map(item => item[col.key]))" />
          </template>
        
          <template v-else>
            {{ col.title }}
          </template>
        
          <template v-if="col.headerActionRender">
            <component :is="col.headerActionRender(col)" />
          </template>
        
          <div
            v-if="col.isDrag"
            class="
              absolute
              right-0
              top-0
              h-full
              w-1
              cursor-col-resize
              select-none
            "
            @mousedown="startResize($event, col)"
          />
        </div>
      </div>

      <div ref="bodyRef" class="x-vtbody flex-1 overflow-x-hidden overflow-y-auto min-h-0" @scroll="onBodyScroll">
        <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
          <div v-for="(row, rowIndex) in visibleData" :key="startIndex + rowIndex"
            :ref="el => observeRow(el, startIndex + rowIndex)"
            class="w-full grid items-center text-sm absolute left-0 right-0"
            :class="[striped && ((startIndex + rowIndex) % 2 === 1) ? 'bg-zinc-50/50 dark:bg-zinc-800/30' : '', 'hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors']"
            :style="{
              gridTemplateColumns: gridTemplateColumns,
              top: prefixHeights[startIndex + rowIndex] + 'px',
              boxShadow: 'inset 0 -1px 0 rgba(156,163,175,0.5)',
            }">
            <template v-if="selection">
              <div class="flex items-center justify-center">
                <input type="checkbox" :checked="isRowSelected(row)" @change="toggleRow(row)">
              </div>
            </template>

            <div v-for="(col, i) in columns" :key="`${col.key}-${startIndex + rowIndex}`"
              :class="b.column({ class: uiColumn })" :style="tableColsStyle[i]">
              <slot :name="`cell-${col.key}`" :row="row" :col="col">
                <template v-if="col.render">
                  <component :is="col.render(row[col.key], row, startIndex + rowIndex)" />
                </template>
                <template v-else>
                  {{ row[col.key] }}
                </template>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
