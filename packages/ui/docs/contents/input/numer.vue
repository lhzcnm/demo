<script setup lang="ts">
const count = ref(0)
</script>

<template>
  <Demo>
    <div class="flex items-center gap-3 w-64">
      <XInputNumber v-model="count" size="sm" />
      <XInputNumber v-model="count" />
      <XInputNumber v-model="count" size="lg" />
    </div>
  </Demo>
</template>
