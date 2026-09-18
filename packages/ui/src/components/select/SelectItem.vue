<script setup lang="ts">
import type { XSelectItemProps, XSelectItemSlots } from './helper'
import { XSELECT_CONTEXT } from './helper'
import { itemStyle } from './_style'
import { Icon } from '@iconify/vue'

defineOptions({ name: 'XSelectItem' })
const props = defineProps<XSelectItemProps>()

const { model, options, itemClick } = inject(XSELECT_CONTEXT)!
const isActive = computed(() => model.value === props.value)

const slot = defineSlots<XSelectItemSlots>()
const defaultSlot = slot.default
  ? slot.default()
  : []

const children = defaultSlot[0]?.children
const isString = typeof children === 'string'
const itemLabel = props.label || (isString ? children : undefined)

options.value.push({
  label: itemLabel || String(props.value),
  value: props.value,
})

const b = itemStyle()
</script>

<template>
  <button
    v-bind="$attrs"
    :class="b.root({ class: uiRoot })"
    @click="itemClick(value)"
  >
    <Icon
      v-if="isActive" icon="lucide:check"
      :class="b.icon({ class: uiIcon })"
    />
    <slot>
      <span :class="b.label({ class: uiLabel })">
        {{ label || value }}
      </span>
    </slot>
  </button>
</template>
