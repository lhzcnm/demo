<script setup lang="ts">
import { Icon } from '@iconify/vue'

import type { XSimplePgnProps } from './helper'
import { simpleStyle } from './_style'

defineOptions({ name: 'XSimplePagination' })

const props = withDefaults(
  defineProps<XSimplePgnProps>(),
  {
    size: 'md',
    limit: 10,
    hideOnSinglePage: false,
  },
)

const current = defineModel({ default: 1 })

const lastPage = computed(() => Math.ceil(props.total / props.limit))
const hidden = computed(() => props.hideOnSinglePage && lastPage.value <= 1)

const isFirstPage = computed(() => current.value === 1)
const isLastPage = computed(() => current.value === lastPage.value)

const normalizedCurrent = computed({
  get: () => Math.max(1, Math.min(current.value, lastPage.value)),
  set: (val) => current.value = Math.max(1, Math.min(val, lastPage.value)),
})

function onPrev() {
  if (normalizedCurrent.value > 1)
    normalizedCurrent.value--
}

function onNext() {
  if (normalizedCurrent.value < lastPage.value)
    normalizedCurrent.value++
}

const b = simpleStyle({ size: props.size })
</script>

<template>
  <div v-if="!hidden" :class="b.root()">
    <button
      :class="b.control()"
      :disabled="isFirstPage"
      @click="onPrev"
    >
      <Icon icon="lucide:chevron-left" class="size-5" />
    </button>

    <div :class="b.pager()">
      <span>{{ normalizedCurrent }}</span>
      <span>/</span>
      <span>{{ lastPage }}</span>
    </div>

    <button
      :class="b.control()"
      :disabled="isLastPage || lastPage === 0"
      @click="onNext"
    >
      <Icon icon="lucide:chevron-right" class="size-5" />
    </button>
  </div>
</template>
