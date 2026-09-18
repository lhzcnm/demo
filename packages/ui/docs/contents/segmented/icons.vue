<script setup lang="ts">
const value = ref('1')
const options = [
  { label: 'Option 1', value: '1', icon: 'lucide:home' },
  { label: 'Option 2', value: '2', icon: 'lucide:popcorn' },
  { label: 'Option 3', value: '3', icon: 'lucide:radiation' },
]
</script>

<template>
  <Demo>
    <div class="flex gap-3">
      <XSegmented
        v-model="value"
        :options="options"
      />
    </div>
  </Demo>
</template>
