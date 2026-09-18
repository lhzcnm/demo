<script setup lang="ts">
import type { XInputNumberEmits, XInputNumberProps } from './helper'
import { style } from './_style'

import { Icon } from '@iconify/vue'

defineOptions({ name: 'XInputNumber' })

const props = withDefaults(
  defineProps<XInputNumberProps>(),
  {
    min: 0,
    max: Infinity,
    precision: 0,
    step: 1,
    size: 'md',
  }
)

const input = defineModel<number>({ required: true })
const emits = defineEmits<XInputNumberEmits>()

function handleMinus() {
  if (input.value > props.min) {
    const value = Number(input.value) - props.step
    input.value = Number(value.toFixed(props.precision))
  }
  emits('change')
}

function handlePlus() {
  if (input.value < props.max) {
    const value = Number(input.value) + props.step
    input.value = Number(value.toFixed(props.precision))
  }
  emits('change')
}

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  let numericValue: any = target.value.replace(/[^\d.-]/g, '')

  const parts = numericValue.split('.')
  if (parts.length > 2) {
    const formattedValue = parts[0] + '.' + parts.slice(1).join('')
    numericValue = Number(formattedValue)
  }

  if (parts.length === 2 && parts[1].length > props.precision) {
    const formattedValue = parts[0] + '.' + parts[1].slice(0, props.precision)
    numericValue = Number(formattedValue)
  }

  const numValue = Number(numericValue)
  if (!isNaN(numValue)) {
    const max = Math.max(numValue, props.min)
    input.value = Math.min(max, props.max)
    target.value = input.value.toString()
  }
  emits('change')
}

function handleKeyDown(e: KeyboardEvent) {
  const allowKeys = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '.', '-', 'Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'
  ]

  if (!allowKeys.includes(e.key)) {
    e.preventDefault()
  }
}

const b = style()
</script>

<template>
  <div :class="b.base({ class: uiRoot, size })">
    <button :class="b.button({ class: uiButton, size })" @click="handleMinus">
      <Icon icon="lucide:minus" class="inline-block" />
    </button>
    <input
      type="text"
      inputmode="decimal"
      :id="id"
      :name="name"
      :value="input"
      :class="b.input({ class: uiInput, size })"
      @change="handleChange"
      @keydown="handleKeyDown"
      @focus="emits('focus', $event)"
      @blur="emits('blur', $event)"
    />
    <button :class="b.button({ class: uiButton, size })" @click="handlePlus">
      <Icon icon="lucide:plus" class="inline-block" />
    </button>
  </div>
</template>
