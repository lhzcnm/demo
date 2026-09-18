<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { Icon } from '@iconify/vue'

import { type XTableProps, type XTableEmits, type XTableColumn, type XTableExpose, type EditState, type EditorDataType } from './helper'
import { handleFormatDecimal, handleFormatNumber, handleFormatPrice, isEmptyValue, isNullish } from '@/utils'
import { style } from './_style'
import { XPopover } from '../popover'
import { XInput, type XInputValue } from '../input'
import { twMerge } from 'tailwind-merge'

defineOptions({ name: 'XTable' })

const props = withDefaults(
  defineProps<XTableProps>(),
  {
    emptyText: '这里空空如也',
    selectionWidth: 55
  }
)

const emit = defineEmits<XTableEmits>()

const selectedList = ref(new Set<any>())
const rootRef = shallowRef<HTMLElement | null>()
const rootClientOpt = ref({
  hasHRoll: false,
  hasVRoll: false,
  height: 0,
  width: 0,
})

const scalableWidth = ref(0)
const tableWidth = ref(0)

const visibleFilters = reactive<Record<string, string[]>>({})
const popoverVisible = reactive<{ [key: string | number | symbol | (string & {})]: boolean }>({})
const filterData = reactive<Record<string, string>>({})
const innerColumns = ref<XTableColumn[]>([])
const editState = ref<EditState | null>(null)
const editTdRef = ref<HTMLElement | null>(null)

let resizingCol: XTableColumn | null = null
let startX = 0
let startWidth = 0

watch(
  () => props.columns,
  (cols) => {
    innerColumns.value = cols.map(col => ({ ...col }))
  },
  { immediate: true, deep: true }
)

const isFirefox = computed(() => {
  const ua = navigator.userAgent.toLowerCase()
  return /firefox/.test(ua) && !/seamonkey/.test(ua)
})

const mergeColumns = computed(() => {
  const cols = innerColumns.value
  if (!props.selection) return cols
  return [
    {
      key: 'selection',
      // align: 'center',
      width: props.selectionWidth,
      headerRender: renderSelectionTh,
      render: renderSelectionTd,
    } as XTableColumn,
    ...cols,
  ]
})

const minWidthOpt = computed(() => {
  const result: Record<string, number> = { sumWidth: 0, count: 0 }
  for (let i = 0; i < mergeColumns.value.length; i++) {
    const col = mergeColumns.value[i]
    if (col.minWidth) {
      result.sumWidth += col.minWidth
      result.count++
    }
  }

  for (let i = 0; i < mergeColumns.value.length; i++) {
    const col = mergeColumns.value[i]
    if (col.minWidth && result.sumWidth > 0) {
      const rate = col.minWidth / result.sumWidth
      result[i] = parseFloat(rate.toFixed(4))
    }
  }

  return result
})

const filteredData = computed(() => {
  return props.data.filter(row => {
    return mergeColumns.value.every(col => {
      if (!col.isFilter) return true

      const key = col.key.toString()
      const rawValue = row[key]
      const value = normalizeFilterValue(rawValue)

      const isEmpty = isEmptyValue(rawValue)

      if (isEmpty && col.showNullOrWhitespace) {
        return true
      }

      if (visibleFilters[key] && !visibleFilters[key].includes(value)) {
        return false
      }

      const keyword = filterData[key]
      if (keyword && !value.includes(keyword)) {
        return false
      }

      return true
    })
  })
})

let stopObserver: any = null

watch(
  () => props.columns.length,
  () => tableWidthObserver(),
  { immediate: true }
)

watch(
  () => props.data,
  () => {
    for (let item of props.data) {
      handleVisibleFilters(item)
    }
    if (!props.selection) return
    if (selectedList.value.size > 0) {
      selectedList.value.clear()
      emit('select-change', [])
    }
  },
  { deep: true }
)

function handleVisibleFilters(data: Record<string, any>) {
  const keys = Object.keys(visibleFilters)
  Object.entries(data).forEach(([key, value]) => {
    if (keys.includes(key)) {
      const val = normalizeFilterValue(value)
      visibleFilters[key] = Array.from(new Set([...visibleFilters[key], val]))
    }
  })
}

function tableWidthObserver() {
  stopObserver && stopObserver()
  const fixedWidth = mergeColumns.value
    .reduce((pre, cur) => pre + (cur.width || 0), 0)

  const sumWidth = minWidthOpt.value.sumWidth
  const tableMinWidth = fixedWidth + sumWidth
  const { stop } = useResizeObserver(rootRef, (entries) => {
    const width = entries[0].contentRect.width
    const target = entries[0].target

    tableWidth.value = Math.max(width, tableMinWidth)
    scalableWidth.value = tableWidth.value - fixedWidth
    rootClientOpt.value = {
      width: target.clientWidth,
      height: target.clientHeight,
      hasHRoll: target.scrollWidth > target.clientWidth,
      hasVRoll: target.scrollHeight > target.clientHeight,
    }
  })

  stopObserver = stop
}

const b = style()

function renderSelectionTh(rows: any[]) {
  let allSelected = false

  if (rows.length > 0) {
    allSelected = rows.every(row => {
      const key = props.selectedKey ? row[props.selectedKey] : row
      return selectedList.value.has(key)
    })
  }

  return h('input', {
    type: 'checkbox',
    name: 'select-all',
    class: 'size-4 align-middle',
    checked: allSelected,
    onChange: (e: InputEvent) => {
      const target = e.target as HTMLInputElement
      let list: any = null

      if (props.selectedKey) list = rows.map(row => row[props.selectedKey!])
      selectedList.value = new Set(target.checked ? list || rows : [])
      emit('select-change', Array.from(selectedList.value))
    },
  })
}

function renderSelectionTd(_: any, row: any) {
  const key = props.selectedKey ? row[props.selectedKey] : row

  return h('input', {
    type: 'checkbox',
    name: 'row-select',
    class: 'size-4 align-middle',
    checked: selectedList.value.has(key),
    onChange: (e: InputEvent) => {
      const target = e.target as HTMLInputElement

      if (target.checked) selectedList.value.add(key)
      else selectedList.value.delete(key)
      emit('select-change', Array.from(selectedList.value))
    },
  })
}

function renderTh(column: XTableColumn, data: any[]) {
  const className = b.th({
    class: column.key === 'selection' ? b.selectionTh() : column.thClassName,
    align: column.align,
    fixed: !!column.fixed,
    fixedSide: column.fixed,
    hidden: column.visible === false,
  })

  const node = column.headerRender
    ? column.headerRender(data)
    : column.title

  const childTools = []

  if (column.isColDel) {
    const icon = h(Icon, { class: "size-4", icon: "lucide:x" })
    childTools.push(h("button", {
      class: 'opacity-0 group-hover:opacity-100 transition-opacity',
      onClick: () => emit("column-delete", column),
    }, icon))
  }

  if (column.isFilter) {
    const disData = data.map(item => item[column.key])
    childTools.push(renderTableFilter(column.key.toString(), disData))
  }

  const children = []
  const isCenter = column.align === "center"

  let childToolContainer

  if (column.key === 'selection') {
    childToolContainer = node
  } else {
    childToolContainer = h("div", { class: twMerge(`
      flex items-center space-x-2
      ${isCenter ? "justify-center" : "justify-between"}
      `) }, [
      node,
      h("div", { class: "flex justify-end space-x-2" }, [childTools])
    ])
  }
  children.push(childToolContainer)

  return h("th", { class: `${className} relative` }, [...children, renderResizeHandle(column)])
}

function renderTableFilter(columnKey: string | number, data: string[]) {
  const countMap: Record<string, number> = {}
  data.forEach(item => {
    const val = normalizeFilterValue(item)
    countMap[val] = (countMap[val] || 0) + 1
  })

  if (!(columnKey in visibleFilters)) {
    visibleFilters[columnKey] = Object.keys(countMap)
  }

  if (popoverVisible[columnKey] === undefined) {
    popoverVisible[columnKey] = false
  }

  if (!(columnKey in filterData)) {
    filterData[columnKey] = ""
  }

  const toggleValue = (val: any) => {
    const arr = visibleFilters[columnKey]
    const idx = arr.findIndex(v => v === val)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(val)
  }

  const filteredOptions = Object.keys(countMap).filter((key) => key.includes(filterData[columnKey]))

  const allSelected = filteredOptions.every(val => visibleFilters[columnKey].includes(val))

  return h(XPopover, {
    modelValue: popoverVisible[columnKey],
    "onUpdate:modelValue": (val: boolean) => popoverVisible[columnKey] = val,
    closeOnClickOutside: true,
  }, {
    trigger: () => h("button", {
      class: "pr-2 opacity-0 group-hover:opacity-100 transition-opacity",
      onClick: () => popoverVisible[columnKey] = true
    }, renderIcon("lucide:filter")),
    default: () => h("div", { class: "p-2 flex flex-col space-y-2 max-h-60 overflow-auto" },
      [
        h("div", { class: "flex items-center space-x-2" }, [
          h("input", {
            type: "checkbox",
            checked: allSelected,
            onChange: (e: Event) => {
              const target = e.target as HTMLInputElement
              if (target.checked) {
                filteredOptions.forEach(val => {
                  if (!visibleFilters[columnKey].includes(val)) {
                    visibleFilters[columnKey].push(val)
                  }
                })
              } else {
                visibleFilters[columnKey] = visibleFilters[columnKey].filter(val => !filteredOptions.includes(val))
              }
            }
          }),
          h(XInput, {
            modelValue: filterData[columnKey],
            placeholder: "filter",
            "onUpdate:modelValue": (val: XInputValue) => filterData[columnKey] = val!.toString(),
          }),
        ]),
        filteredOptions.map((val) =>
          h("label", { class: "flex items-center space-x-2" }, [
            h("input", {
              type: "checkbox",
              checked: visibleFilters[columnKey].includes(val),
              onChange: () => toggleValue(val),
            }),
            h("span", { innerHTML: `${val === '' ? '(空)' : val} (${countMap[val]})` })
          ])
        )
      ]
    )
  })
}

function normalizeFilterValue(val: any) {
  return isEmptyValue(val) ? '' : String(val)
}

function renderIcon(icon: string) {
  return h(Icon, { class: "size-4", icon: icon })
}

function renderTd(row: any, index: number, column: XTableColumn) {
  const className = b.td({
    class: column.key === 'selection' ? b.selectionTd() : column.tdClassName,
    align: column.align,
    fixed: !!column.fixed,
    fixedSide: column.fixed,
    hidden: column.visible === false,
  })

  const isEditing =
    editState.value &&
    editState.value.rowIndex === index &&
    editState.value.key === column.key

  if (isEditing) {
    return h('td', {
      ref: editTdRef,
      class: className,
      'data-editing': 'true',
    }, [ renderEditor(column) ])
  }

  const child = isNullish(row[column.key]) ? column.cellEmpty : row[column.key]
  if (!column.render) return h('td', { class: className }, child)
  const node = column.render(child, row, index)

  if (column.fixed) {
    return h(
      'td', { class: className },
      h('div', { class: 'space-x-2' }, node),
    )
  }

  return h('td', {
    class: className,
    ...getEditorTriggerEvent(column, row, index),
  }, node)
}

function rowClickWrapper(eventName: any) {
  return function (e: MouseEvent) {
    const target = e.target as HTMLElement
    const element = target.closest('[data-index]')
    if (!element) return

    const dataIndex = element.getAttribute('data-index')
    const index = parseInt(dataIndex || '0')

    if (index === -1) return
    emit(eventName, props.data[index], index)
  }
}

const handleRowClick = rowClickWrapper('row-click')
const handleRowDblClick = rowClickWrapper('row-dblclick')

function getColWidth(column: XTableColumn, idx: number) {
  if (column.width) return column.width
  if (column.minWidth) {
    const scaleFactor = minWidthOpt.value[idx]
    const width = scaleFactor * scalableWidth.value
    return Math.max(+width.toFixed(2), column.minWidth)
  }

  return 0
}

function scrollToTop() {
  rootRef.value?.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

function renderResizeHandle(column: XTableColumn) {
  if (!column.isDrag) return null

  return h('div', {
    class: 'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none',
    onMousedown: (e: MouseEvent) => startResize(e, column),
  }, [
    h("hr", { class: "h-full w-px bg-border" })
  ])
}

function startResize(e: MouseEvent, column: XTableColumn) {
  e.preventDefault()
  e.stopPropagation()

  resizingCol = column
  startX = e.clientX
  const idx = mergeColumns.value.findIndex(c => c === column)
  startWidth = getColWidth(column, idx)

  document.addEventListener('mousemove', onResizing)
  document.addEventListener('mouseup', stopResize)
}

function stopResize() {
  resizingCol = null
  document.removeEventListener('mousemove', onResizing)
  document.removeEventListener('mouseup', stopResize)
}

function onResizing(e: MouseEvent) {
  if (!resizingCol) return

  const delta = e.clientX - startX
  const nextWidth = startWidth + delta
  const min = resizingCol.minWidth ?? 60

  resizingCol.width = Math.max(min, nextWidth)
}

function initFilter() {
  Object.keys(filterData).forEach(key => {
    delete filterData[key]
  })
}

function startEdit(
  column: XTableColumn,
  row: Record<string, any>,
  index: number
) {
  if (!column.edit) {
    return
  }

  const key = column.key as string

  editState.value = {
    rowIndex: index,
    key: key,
    value: row[key],
    type: column.edit.dataType ?? 'string'
  }
}

function renderEditor(
  column: XTableColumn
) {
  if (!editState.value) {
    return null
  }

  return h(XInput, {
    modelValue: editState.value.value,
    
    "onUpdate:modelValue": (val: XInputValue) => {
      editState.value!.value = formatEditValue(val, editState.value!.type, column.edit?.decimalPrecision)
    },

    // onInput: (e: Event) => {
      // const target = e.target as HTMLInputElement
      // editState.value!.value = formatEditValue(target.value, editState.value!.type)
    // },

    onBlur: () => {
      saveEdit()
    },

    onKeydown: (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        saveEdit()
      }

      if (e.key === 'Escape') {
        editState.value = null
      }
    }
  })
}

function formatEditValue(
  val: XInputValue,
  type: EditorDataType,
  devimalPrecision?: number
) {
  switch(type) {
    case 'number':
      return handleFormatNumber(String(val))
    
    case 'price':
      return handleFormatPrice(String(val))

    case 'decimal':
      return handleFormatDecimal(String(val), devimalPrecision)
    
    default:
      return val as string
  }
}

function saveEdit() {
  if (!editState.value) {
    return
  }

  const {
    rowIndex,
    key,
    value
  } = editState.value

  const column = props.columns.find(
    item =>
      item.key === key
  )

  if (!column) {
    return
  }

  const row =
    props.data[rowIndex]

  column.edit?.onSaveEdit?.(row, value)

  editState.value = null
}

function getEditorTriggerEvent(
  column: XTableColumn,
  row: Record<string, any>,
  index: number
) {
  if (!column.edit?.trigger) {
    return {}
  }

  const eventName =
    column.edit.trigger === 'dblclick'
      ? 'onDblclick'
      : 'onClick'

  return {
    [eventName]: () => {
      startEdit(column, row, index)
    }
  }
}

function handleOutsideClick(
  e: MouseEvent
) {
  if (!editState.value) {
    return
  }

  const column = props.columns.find(
    item =>
      item.key === editState.value?.key
  )

  const outside =
    column?.edit?.outside

  if (!outside?.close) {
    return
  }

  const target = e.target as HTMLElement

  // 点击编辑区域，不处理
  if (
    editTdRef.value?.contains(target)
  ) {
    return
  }

  if (outside.save) {
    saveEdit()
  } else {
    editState.value = null
  }
}

defineExpose<XTableExpose>({
  scrollToTop,
  initFilter,
})

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.addEventListener('mousedown', handleOutsideClick)
})
</script>

<template>
  <div ref="rootRef" :class="b.base({ class: props.class })" :style="{ '--bg': 'hsl(var(--background))' }">
    <div v-if="!isFirefox" class="fixed z-20 pointer-events-none" :class="{
      'border-b': rootClientOpt.hasHRoll,
      'border-r': rootClientOpt.hasVRoll,
    }" :style="{
      width: `${rootClientOpt.width}px`,
      height: `${rootClientOpt.height}px`,
    }" />
    <table :style="`width: ${tableWidth}px`" :class="b.table({
      class: props.uiTable,
      isEmpty: data.length === 0,
    })">
      <colgroup>
        <template v-for="(col, idx) in mergeColumns" :key="col.key">
          <col v-if="col.visible !== false" :width="getColWidth(col, idx)" />
        </template>
      </colgroup>
      <thead class="sticky top-0 z-10 bg-[var(--bg)]">
        <tr class="text-left">
          <template v-for="column in mergeColumns" :key="column.key">
            <component :is="renderTh(column, data)" />
          </template>
        </tr>
      </thead>
      <tbody @click="handleRowClick" @dblclick="handleRowDblClick">
        <tr class="text-center" data-index="-1">
          <td :colspan="mergeColumns.length" class="relative h-0.5 overflow-hidden">
            <div v-show="loading" class="absolute inset-0 bg-primary/10">
              <div class="h-full w-1/3 x-animation-slide rounded bg-primary" />
            </div>
          </td>
        </tr>
        <tr v-if="data.length === 0" class="text-center" data-index="-1">
          <td :colspan="mergeColumns.length" class="min-h-24 text-muted-foreground">
            {{ emptyText }}
          </td>
        </tr>
        <tr v-for="(row, index) in filteredData" :key="rowKey ? row[rowKey] : index" :data-index="index">
          <component v-for="column in mergeColumns" :key="column.key" :is="renderTd(row, index, column)" />
        </tr>
      </tbody>
    </table>
  </div>
</template>
