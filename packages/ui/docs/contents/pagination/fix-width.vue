<script setup lang="ts">
const page = ref(1)
const limit = ref(20)
</script>

<template>
  <Demo>
    <div class="flex gap-3">
      <XPagination
        v-model="page"
        v-model:limit="limit"
        :fix-width="false"
        :total="500"
      />
    </div>
  </Demo>
</template>
