<script setup lang="ts">
const page = ref(1)
const limit = ref(10)
</script>

<template>
  <Demo>
    <div class="flex gap-3">
      <XPagination
        v-model="page"
        v-model:page="limit"
        :total="100"
      />
    </div>
  </Demo>
</template>
