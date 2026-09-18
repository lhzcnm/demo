<script setup lang="ts">
const props = defineProps<{
  max: number
  modelValue: number
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

function scrollUp() {
  emit('update:modelValue', (props.modelValue - 1 + props.max) % props.max)
}

function scrollDown() {
  emit('update:modelValue', (props.modelValue + 1) % props.max)
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  if (e.deltaY > 0) scrollDown()
  else scrollUp()
}

const display = computed(() => {
  const cur = props.modelValue
  const prev = (cur - 1 + props.max) % props.max
  const next = (cur + 1) % props.max
  return [
    String(prev).padStart(2, '0'),
    String(cur).padStart(2, '0'),
    String(next).padStart(2, '0')
  ]
})
</script>

<template>
  <div class="flex flex-col items-center w-12 select-none" @wheel="onWheel">
    <button class="text-xs text-muted-foreground hover:text-foreground" @click="scrollUp">▲</button>
    <div class="h-[72px] overflow-hidden flex flex-col items-center relative">
      <div
        class="flex flex-col items-center transition-transform duration-200 ease-in-out"
      >
        <div class="text-muted-foreground text-sm h-6 flex items-center justify-center">{{ display[0] }}</div>
        <div class="text-lg font-semibold text-foreground h-6 flex items-center justify-center">{{ display[1] }}</div>
        <div class="text-muted-foreground text-sm h-6 flex items-center justify-center">{{ display[2] }}</div>
      </div>
    </div>
    <button class="text-xs text-muted-foreground hover:text-foreground" @click="scrollDown">▼</button>
  </div>
</template>
