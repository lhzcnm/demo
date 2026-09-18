<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { twMerge } from 'tailwind-merge'

import type { XNativeSelectValue, XNativeSelectProps, XNativeSelectEmits } from './helper'

defineOptions({ name: 'XNativeSelect' })

const props = defineProps<XNativeSelectProps>()
const emit = defineEmits<XNativeSelectEmits>()

const selected = defineModel<XNativeSelectValue>({ required: true })

function handleChange() {
  emit('change', selected.value!)
}
</script>

<template>
  <div class="relative w-full">
    <Icon 
      icon="lucide:chevron-down" :width="20"
      :class="twMerge(
        'absolute right-2 top-1/2 transform -translate-y-1/2',
        'pointer-events-none text-muted-foreground bg-card',
        disabled ? 'opacity-50' : '',
        props.iconClass,
      )"
    />

    <select
      v-model="selected"
      :class="twMerge(
        'w-full h-10 px-2 bg-card rounded appearance-none overflow-hidden',
        'border-r-8 border-r-transparent ring-1 ring-input shadow-sm',
        'outline-none focus:ring-primary disabled:opacity-50',
        props.class
      )"
      :disabled="disabled"
      @change="handleChange"
    >
      <option
        v-if="placeholder"
        :value="default" class="bg-card"
      >
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option[valueKey]"
        :value="option[valueKey]"
        class="bg-card"
      >
        {{ option[labelKey] }}
      </option>
    </select>
  </div>
</template>
