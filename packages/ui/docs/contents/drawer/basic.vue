<script setup lang="ts">
const visible = ref(false)
const value = ref('1')
</script>

<template>
  <Demo>
    <div class="flex">
      <XButton @click="visible = true">Open</XButton>
    </div>
    <XDrawer v-model="visible" title="标题">
      <XSelect v-model="value" @selected="console.log($event)">
        <XSelectItem value="1">Option 1</XSelectItem>
        <XSelectItem value="2">Option 2</XSelectItem>
        <XSelectItem value="3">Option 3</XSelectItem>
      </XSelect>
    </XDrawer>
  </Demo>
</template>
