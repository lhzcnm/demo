<script setup lang="ts">
import type { XDateRangePickerProps, XDateRangePickerEmits, XDatePickerRange, XDatePickerValue } from './helper'
import { Icon } from '@iconify/vue'

import { XPopover } from '../popover'
import { XButton } from '../button'
import { style } from './_style'

import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'

dayjs.locale('zh-cn')

defineOptions({ name: 'XDateRangePicker' })

const props = withDefaults(
  defineProps<XDateRangePickerProps>(),
  {
    labelFormat: 'YYYY-MM-DD HH:mm:ss',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    placeholder: '选择日期范围',
  }
)

const emit = defineEmits<XDateRangePickerEmits>()
const startDate = defineModel<XDatePickerValue>('start', {default: null})
const endDate = defineModel<XDatePickerValue>('end', {default: null})

const isOpen = ref(false)

const currentDate = shallowRef(dayjs())
const today = currentDate.value.date()
const month = currentDate.value.month()

const tempStartDate = ref<XDatePickerValue>(null)
const tempEndDate = ref<XDatePickerValue>(null)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentYear = computed(() => currentDate.value.year())
const currentMonth = computed(() => currentDate.value.format('MMMM'))

const isSelected = computed(() => startDate.value && endDate.value)

const hoverDate = ref<Date | null>(null)

const days = computed(() => {
  const current = currentDate.value
  
  const firstDayOfMonth = current.startOf('month')
  const lastDayOfMonth = current.endOf('month')
  const daysFromPrevMonth = firstDayOfMonth.day()
  const daysInMonth = lastDayOfMonth.date()

  const days = []

  // add days of previous month
  for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
    const date = dayjs(firstDayOfMonth).subtract(i + 1, 'day')
    days.push({
      day: date.date(),
      month: date.month(),
      date: date.toDate(),
      isCurrentMonth: false,
    })
  }

  // add days of current month
  for (let i = 0; i < daysInMonth; i++) {
    const date = dayjs(firstDayOfMonth).add(i, 'day')
    days.push({
      day: date.date(),
      month: date.month(),
      date: date.toDate(),
      isCurrentMonth: true,
    })
  }

  // add days of next month, fill 42 cells (6 rows * 7 columns)
  const daysRequired = 42 - days.length

  for (let i = 1; i <= daysRequired; i++) {
    const date = dayjs(lastDayOfMonth).add(i, 'day')
    days.push({
      day: date.date(),
      month: date.month(),
      date: date.toDate(),
      isCurrentMonth: false,
    })
  }

  return days
})

const daysWithState = computed(() => {
  return days.value.map(item => ({
    ...item,
    ...getDayState(item.date)
  }))
})

watch(isOpen, (value) => {
  if (!value) return

  tempStartDate.value = startDate.value
  tempEndDate.value = endDate.value
})

function prevMonth() {
  currentDate.value = currentDate.value.subtract(1, 'month')
}

function nextMonth() {
  currentDate.value = currentDate.value.add(1, 'month')
}

function handleCalendarClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  const dayElement = target.closest('[data-index]')

  if (!dayElement) return
  
  const index = parseInt(dayElement.getAttribute('data-index') || '0')
  const day = days.value[index]
  
  // only handle date click of current month
  if (day && day.isCurrentMonth) {
    selectDate(day.date)
  }
}

function selectDate(curSelectedDate: Date) {
  const selectedDate = dayjs(curSelectedDate)
  
  // if no start date is selected, or a complete range is selected, start a new selection
  if (!tempStartDate.value || (tempStartDate.value && tempEndDate.value)) {
    tempStartDate.value = selectedDate.toDate()
    tempEndDate.value = null
  }
  // if start date is selected, select end date
  else {
    const start = dayjs(tempStartDate.value)

    // if end date is same as start date
    if (selectedDate.isSame(start, 'day')) {
      return
    }

    // if end date is after selected date
    else if (selectedDate.isAfter(start, 'day')) {
      tempEndDate.value = selectedDate.toDate()
    }
    // else swap two dates (selected date is before start date)
    else {
      tempEndDate.value = tempStartDate.value
      tempStartDate.value = selectedDate.toDate()
    }
  }
}

function getDayState(date: XDatePickerValue) {
  if (!tempStartDate.value && !tempEndDate.value) {
    return { isSelected: false, isInRange: false, isHoverRange: false }
  }

  const current = dayjs(date)
  const start = dayjs(tempStartDate.value)
  const end = dayjs(tempEndDate.value)
  
  // compute hover range
  let isHoverRange = false
  if (tempStartDate.value && !tempEndDate.value && hoverDate.value) {
    const hover = dayjs(hoverDate.value)

    if (hover.isAfter(start)) {
      isHoverRange = current.isAfter(start, 'day') &&
       current.isBefore(hover, 'day') ||
       current.isSame(hover, 'day')
    }
    else {
      isHoverRange = current.isAfter(hover, 'day') &&
        current.isBefore(start, 'day') ||
        current.isSame(hover, 'day')
    }
  }

  return {
    isSelected: current.isSame(start, 'day') || current.isSame(end, 'day'),
    isInRange: current.isAfter(start, 'day') && current.isBefore(end, 'day'),
    isHoverRange
  }
}

function handleDayMouseEnter(index: number) {
  const day = days.value[index]
  if (day && day.isCurrentMonth) {
    hoverDate.value = day.date
  }
}

function applySelection() {
  const start = tempStartDate.value
  const end = tempEndDate.value

  if (!start || !end) {
    startDate.value = null
    endDate.value = null
  }
  else {
    const startFmt = dayjs(start).format(props.valueFormat)
    const endFmt = dayjs(end).format(props.valueFormat)

    startDate.value = startFmt
    endDate.value = endFmt
  }

  emit('apply', [startDate.value, endDate.value])
  isOpen.value = false
}

function clearSelection() {
  tempStartDate.value = null
  tempEndDate.value = null
}

function formatDateDisplay(date: XDatePickerRange) {
  const start = dayjs(date[0])
  const end = dayjs(date[1])

  const startFmt = start.format(props.labelFormat)
  const endFmt = end.format(props.labelFormat)

  if (start.isSame(end, 'day')) return startFmt
  else return `${startFmt} - ${endFmt}`
}

const b = style()
</script>

<template>
  <XPopover
    v-model="isOpen"
    :sync-width="false"
    :ui-content="b.content({ class: uiContent })"
    close-on-esc close-on-click-outside
    placement="bottom-start"
    @closed="clearSelection"
  >
    <template #trigger>
      <button :class="b.trigger({ class: uiTrigger })">
        <div class="flex-1 text-left text-sm">
          <span v-if="!isSelected" class="text-muted-foreground">{{ placeholder }}</span>
          <span v-else>{{ formatDateDisplay([startDate, endDate]) }}</span>
        </div>
        <Icon icon="lucide:calendar" class="size-4 text-muted-foreground" />
      </button>
    </template>

    <div :class="b.control()">
      <button :class="b.controlBtn()" @click="prevMonth">
        <Icon icon="lucide:chevron-left" class="size-5" />
      </button>
      <div class="text-sm font-medium">{{ currentMonth }} {{ currentYear }}</div>
      <button :class="b.controlBtn()" @click="nextMonth">
        <Icon icon="lucide:chevron-right" class="size-5" />
      </button>
    </div>

    <div class="grid grid-cols-7 gap-1 mb-1">
      <div
        v-for="day in weekDays" :key="day"
        class="p-1 text-center text-xs font-medium text-muted-foreground"
      >
        {{ day }}
      </div>
    </div>

    <div
      class="grid grid-cols-7 gap-1"
      @click="handleCalendarClick"
    >
      <button
        v-for="(item, index) in daysWithState" :key="index"
        :tabindex="item.isCurrentMonth ? 0 : -1"
        :data-index="index"
        :class="b.dayItem({
          isToday: item.day === today && month === item.month,
          isCurrentMonth: item.isCurrentMonth,
          isSelected: item.isSelected && !item.isInRange,
          isInRange: item.isInRange && !item.isSelected,
          isHoverRange: item.isHoverRange
        })"
        @mouseenter="handleDayMouseEnter(index)"
        @mouseleave="hoverDate = null"
      >
        {{ item.day }}
      </button>
    </div>

    <div class="flex justify-between pt-3 mt-2 border-t">
      <XButton variant="outline" size="sm" label="清除" @click="clearSelection" />
      <XButton label="确认" size="sm" @click="applySelection" />
    </div>
  </XPopover>
</template>
