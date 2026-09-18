<script setup lang="ts">
const value = ref()

const options = [
  { value: 1, label: 'Option 1' },
  { value: 2, label: 'Option 2' },
  { value: 3, label: 'Option 3' },
]
</script>

<template>
  <Demo>
    <XNativeSelect
      v-model="value"
      :options="options"
      :default="undefined"
      placeholder="Select an option"
      value-key="value"
      label-key="label"
    />
  </Demo>
</template>
