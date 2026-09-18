<script setup lang="ts">
const value = ref()
</script>

<template>
  <Demo>
    <XSelect
      v-model="value"
      clearable
      ui-trigger="w-64"
      @selected="console.log($event)"
    >
      <XSelectItem value="1">Option 1</XSelectItem>
      <XSelectItem value="2">Option 2</XSelectItem>
      <XSelectItem value="3">Option 3</XSelectItem>
    </XSelect>
  </Demo>
</template>
