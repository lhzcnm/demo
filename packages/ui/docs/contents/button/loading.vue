<script setup lang="ts">
const loading = ref(false)

function handleClick() {
  loading.value = !loading.value
  setTimeout(() => loading.value = false, 2000)
}
</script>

<template>
  <Demo>
    <div class="flex gap-2">
      <XButton :loading @click="handleClick">Button</XButton>
    </div>
  </Demo>
</template>
