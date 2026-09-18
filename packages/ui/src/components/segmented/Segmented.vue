<script setup lang="ts">
import type { XSegmentedProps, XSegmentedEmits, XSegmentedValue } from './helper'
import { Icon } from '@iconify/vue'
import { style } from './_style'

defineOptions({ name: 'XSegmented' })

const props = withDefaults(
  defineProps<XSegmentedProps>(),
  {
    color: 'blue',
    size: 'md',
  }
)

const emit = defineEmits<XSegmentedEmits>()
const active = defineModel<XSegmentedValue>({ required: true })

const activeIndex = computed(() =>
  props.options.findIndex((opt) => opt.value === active.value)
)

const indicatorOffset = ref(0)
const indicatorWidth = ref(0)

const buttons = ref<HTMLButtonElement[]>([])

function handleClick(value: string | number) {
  active.value = value
  emit('change', value)
}

function updateIndicator(index: number) {
  const btn = buttons.value[index]
  if (btn) {
    indicatorOffset.value = btn.offsetLeft
    indicatorWidth.value = btn.offsetWidth
  }
}

watch(
  activeIndex,
  (idx) => {
    if (idx >= 0) updateIndicator(idx)
  },
  { immediate: true }
)

const b = style({
  color: props.color,
  size: props.size
})

onMounted(() => {
  if(activeIndex.value >= 0) {
    updateIndicator(activeIndex.value)
  }
})
</script>

<template>
  <div :class="b.root({ class: uiRoot })">
    <div :class="b.container({ class: uiContainer })">
      <div
        :class="b.indicator({ class: uiIndicator })"
        :style="{
          transform: `translateX(${indicatorOffset}px)`,
          width: `${indicatorWidth}px`,
        }"
      />

      <button
        v-for="option in props.options"
        :key="option.value"
        ref="buttons"
        type="button"
        :class="b.button({
          isActive: active === option.value,
          class: uiButton,
        })"
        @click="handleClick(option.value)"
      >
        <Icon
          v-if="option.icon"
          :icon="option.icon"
          :class="b.icon()"
        />
        <span>{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>
