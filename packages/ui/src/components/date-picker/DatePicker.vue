<script setup lang="ts">
import type { XDatePickerProps, XDatePickerEmits, XDatePickerValue } from './helper'
import { Icon } from '@iconify/vue'
import { XPopover } from '../popover'
import { XButton } from '../button'
import { style } from './_style'

import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'
dayjs.locale('zh-cn')

defineOptions({ name: 'XDatePicker' })

const props = withDefaults(
  defineProps<XDatePickerProps>(),
  {
    labelFormat: 'YYYY-MM-DD HH:mm:ss',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    placeholder: '选择日期时间',
    visibleTime: false,
  }
)

const emit = defineEmits<XDatePickerEmits>()
const selectedDate = defineModel<XDatePickerValue>({ default: null })

const isOpen = ref(false)
const currentDate = shallowRef(dayjs())
const today = currentDate.value.date()
const month = currentDate.value.month()
const tempSelectedDate = ref<XDatePickerValue>(null)
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const currentYear = computed(() => currentDate.value.year())
const currentMonth = computed(() => currentDate.value.format('MMMM'))
const isSelected = computed(() => !!selectedDate.value)

// === 时间逻辑 ===
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

watch(isOpen, (open) => {
  if (open) {
    tempSelectedDate.value = selectedDate.value
    if (selectedDate.value) {
      const d = dayjs(selectedDate.value)

      currentDate.value = d.startOf("month")
      hours.value = d.hour()
      minutes.value = d.minute()
      seconds.value = d.second()
    } else {
      currentDate.value = dayjs().startOf("month")
      hours.value = 0
      minutes.value = 0
      seconds.value = 0
    }
  }
})

// === 工具函数 ===
function pad(n: number) {
  return String(n).padStart(2, '0')
}
function incHour() { hours.value = (hours.value + 1) % 24 }
function decHour() { hours.value = (hours.value + 23) % 24 }
function incMinute() { minutes.value = (minutes.value + 1) % 60 }
function decMinute() { minutes.value = (minutes.value + 59) % 60 }
function incSecond() { seconds.value = (seconds.value + 1) % 60 }
function decSecond() { seconds.value = (seconds.value + 59) % 60 }

// === 日期逻辑 ===
const days = computed(() => {
  const current = currentDate.value
  const firstDayOfMonth = current.startOf('month')
  const lastDayOfMonth = current.endOf('month')
  const daysFromPrevMonth = firstDayOfMonth.day()
  const daysInMonth = lastDayOfMonth.date()
  const days = []

  for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
    const date = dayjs(firstDayOfMonth).subtract(i + 1, 'day')
    days.push({ day: date.date(), month: date.month(), date: date.toDate(), isCurrentMonth: false })
  }

  for (let i = 0; i < daysInMonth; i++) {
    const date = dayjs(firstDayOfMonth).add(i, 'day')
    days.push({ day: date.date(), month: date.month(), date: date.toDate(), isCurrentMonth: true })
  }

  const daysRequired = 42 - days.length
  for (let i = 1; i <= daysRequired; i++) {
    const date = dayjs(lastDayOfMonth).add(i, 'day')
    days.push({ day: date.date(), month: date.month(), date: date.toDate(), isCurrentMonth: false })
  }

  return days
})

const daysWithState = computed(() => days.value.map(item => ({
  ...item,
  ...getDayState(item.date)
})))

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
  if (day && day.isCurrentMonth) selectDate(day.date)
}
function selectDate(curSelectedDate: Date) {
  tempSelectedDate.value = curSelectedDate
}
function getDayState(date: XDatePickerValue) {
  if (!tempSelectedDate.value) return { isSelected: false }
  const current = dayjs(date)
  const selected = dayjs(tempSelectedDate.value)
  return { isSelected: current.isSame(selected, 'day') }
}

// === 确认与清空 ===
function applySelection() {
  if (!tempSelectedDate.value) {
    selectedDate.value = null
  } else {
    const combined = dayjs(tempSelectedDate.value)
      .hour(hours.value)
      .minute(minutes.value)
      .second(seconds.value)
    selectedDate.value = combined.format(props.valueFormat)
  }
  emit('apply', selectedDate.value)
  isOpen.value = false
}
function clearSelection() {
  tempSelectedDate.value = null
  hours.value = 0
  minutes.value = 0
  seconds.value = 0
}
function formatDateDisplay(date: XDatePickerValue) {
  if (!date) return ''
  return dayjs(date).format(props.labelFormat)
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
    <!-- 触发按钮 -->
    <template #trigger>
      <button :class="b.trigger({ class: uiTrigger })">
        <div class="flex-1 text-left text-sm">
          <span v-if="!isSelected" class="text-muted-foreground">{{ placeholder }}</span>
          <span v-else>{{ formatDateDisplay(selectedDate) }}</span>
        </div>
        <Icon icon="lucide:calendar" class="size-4 text-muted-foreground" />
      </button>
    </template>

    <!-- 时间滚动选择区域 -->
    <div v-if="visibleTime" class="flex justify-center gap-4 items-center mt-3 mb-2 select-none">
      <div class="flex flex-col items-center">
        <button @click="decHour" class="text-xs text-muted-foreground hover:text-foreground">
          <Icon icon="lucide:chevron-up" />
        </button>
        <div class="text-lg font-semibold">{{ pad(hours) }}</div>
        <button @click="incHour" class="text-xs text-muted-foreground hover:text-foreground">
          <Icon icon="lucide:chevron-down" />
        </button>
      </div>
      <span class="text-muted-foreground text-lg">:</span>
      <div class="flex flex-col items-center">
        <button @click="decMinute" class="text-xs text-muted-foreground hover:text-foreground">
          <Icon icon="lucide:chevron-up" />
        </button>
        <div class="text-lg font-semibold">{{ pad(minutes) }}</div>
        <button @click="incMinute" class="text-xs text-muted-foreground hover:text-foreground">
          <Icon icon="lucide:chevron-down" />
        </button>
      </div>
      <span class="text-muted-foreground text-lg">:</span>
      <div class="flex flex-col items-center">
        <button @click="decSecond" class="text-xs text-muted-foreground hover:text-foreground">
          <Icon icon="lucide:chevron-up" />
        </button>
        <div class="text-lg font-semibold">{{ pad(seconds) }}</div>
        <button @click="incSecond" class="text-xs text-muted-foreground hover:text-foreground">
          <Icon icon="lucide:chevron-down" />
        </button>
      </div>
    </div>

    <!-- 日历控制条 -->
    <div :class="b.control()">
      <button :class="b.controlBtn()" @click="prevMonth">
        <Icon icon="lucide:chevron-left" class="size-5" />
      </button>
      <div class="text-sm font-medium">{{ currentMonth }} {{ currentYear }}</div>
      <button :class="b.controlBtn()" @click="nextMonth">
        <Icon icon="lucide:chevron-right" class="size-5" />
      </button>
    </div>

    <!-- 星期标题 -->
    <div class="grid grid-cols-7 gap-1 mb-1">
      <div
        v-for="day in weekDays"
        :key="day"
        class="p-1 text-center text-xs font-medium text-muted-foreground"
      >
        {{ day }}
      </div>
    </div>

    <!-- 日期格子 -->
    <div class="grid grid-cols-7 gap-1" @click="handleCalendarClick">
      <button
        v-for="(item, index) in daysWithState"
        :key="index"
        :tabindex="item.isCurrentMonth ? 0 : -1"
        :data-index="index"
        :class="b.dayItem({
          isToday: item.day === today && month === item.month,
          isCurrentMonth: item.isCurrentMonth,
          isSelected: item.isSelected
        })"
      >
        {{ item.day }}
      </button>
    </div>

    <!-- 底部操作 -->
    <div class="flex justify-between pt-3 mt-2 border-t">
      <XButton variant="outline" size="sm" label="清除" @click="clearSelection" />
      <XButton label="确认" size="sm" @click="applySelection" />
    </div>
  </XPopover>
</template>
