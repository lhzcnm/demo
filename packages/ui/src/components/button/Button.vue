<script setup lang="ts">
import type { XBtnProps } from './helper'
import { Icon } from '@iconify/vue'
import { style } from './_style'

defineOptions({ name: 'XButton' })

const props = defineProps<XBtnProps>()
const isDisabled = computed(() => props.loading || props.disabled)
</script>

<template>
  <button
    :class="style({
      class: props.class,
      disabled: isDisabled,
      variant: props.variant,
      color: props.color,
      size: props.size,
    })"
    :disabled="isDisabled"
  >
    <Transition name="x-icon" mode="out-in">
      <span v-if="loading" class="size-[1em]">
        <Icon icon="lucide:loader" class="size-full animate-spin" />
      </span>
      <span v-else-if="icon" class="size-[1em]">
        <Icon :icon="icon" class="size-full" />
      </span>
    </Transition>
    <span><slot>{{ props.label }}</slot></span>
  </button>
</template>
