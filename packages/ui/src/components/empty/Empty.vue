<script setup lang="ts">
import type { XEmptyProps } from './helper'
import { style } from './_style'

defineOptions({ name: 'XEmpty' })

withDefaults(
  defineProps<XEmptyProps>(),
  {
    title: '',
  }
)

const b = style()
</script>

<template>
  <div :class="b.root({ class: uiRoot })">
    <img
      :class="b.image({ class: uiImage })"
      :src="src" alt="NOT DATA" draggable="false"
    >
    <slot>
      <div :class="b.title({ class: uiTitle })">
        {{ title }}
      </div>
    </slot>
  </div>
</template>
