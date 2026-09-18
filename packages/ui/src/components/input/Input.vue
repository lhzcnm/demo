<script setup lang="ts">
import { Icon } from '@iconify/vue'

import type { XInputEmits, XInputProps, XInputValue } from './helper'
import { style } from './_style'

defineOptions({ name: 'XInput' })
withDefaults(
  defineProps<XInputProps>(),
  {
    class: '',
    clearable: false,
  }
)

const emit = defineEmits<XInputEmits>()
const value = defineModel<XInputValue>({ default: '' })

function handleClear() {
  value.value = ''
  emit('clear')
}

const b = style()
</script>

<template>
  <div :class="b.root({ class: uiRoot, disabled })">
    <span v-if="icon" :class="b.icon()">
      <Icon :icon="icon" />
    </span>
    <input
      v-model="value"
      :id="id"
      :name="name"
      :disabled="disabled"
      :class="b.input({ hasIcon: !!icon, clearable, disabled })"
      :placeholder="placeholder" :type="type"
    />
    <button
      v-if="clearable && value"
      :disabled="disabled"
      :class="b.clear({ disabled })"
      @click="handleClear"
    >
      <Icon icon="lucide:x" />
    </button>
  </div>
</template>
