<script setup lang="ts">
const active = ref('1')
const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
]
</script>

<template>
  <Demo>
    <div class="flex flex-wrap gap-3">
      <XSegmented v-model="active" :options="options" />
      <XSegmented v-model="active" :options="options" color="teal" />
    </div>
  </Demo>
</template>
