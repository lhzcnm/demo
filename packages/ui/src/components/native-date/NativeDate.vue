<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'

import type { XNativeDateProps } from './helper'
import type { XDatePickerValue } from '../date-picker'

defineOptions({ name: 'XNativeDate' })

const props = withDefaults(
  defineProps<XNativeDateProps>(),
  {
    class: '',
    disabled: false,
    placeholder: '请选择日期',
    dateFormatter: "YYYY-MM-DD HH:mm:ss",
    type: "date",
  },
)

const date = defineModel<XDatePickerValue>({ default: '' })
const inputRef = ref<HTMLInputElement | null>(null)

const displayValue = computed(() => {
  if (!date.value) return ''
  return dayjs(date.value).format(props.dateFormatter)
})

function handleClick() {
  if (!props.disabled && inputRef.value) {
    inputRef.value.showPicker()
  }
}

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  date.value = dayjs(target.value).format(props.dateFormatter)
}
</script>

<template>
  <div class="relative w-full" @click="handleClick">
    <input
      ref="inputRef"
      v-model="date"
      :disabled="disabled" :type="type"
      class="absolute top-0 bottom-0 left-0 right-0 opacity-0 cursor-pointer"
      @change="handleChange"
    />

    <div
      :class="twMerge(
        'flex items-center justify-between w-full h-10 px-3 shadow-sm',
        'bg-transparent rounded ring-1 ring-input hover:ring-hover',
        'focus-within:ring-2 focus-within:ring-primary',
        disabled && 'opacity-50 cursor-not-allowed',
        'transition-all duration-200',
        props.class,
      )"
    >
      <span
        :class="twMerge(
          'flex-1 truncate text-sm',
          !date && 'text-muted-foreground',
        )"
      >
        {{ displayValue || placeholder }}
      </span>
      <Icon
        icon="lucide:calendar"
        class="flex-shrink-0 size-4 text-muted-foreground"
      />
    </div>
  </div>
</template>
