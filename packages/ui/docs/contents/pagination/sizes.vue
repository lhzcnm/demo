<script setup lang="ts">
const page = ref(1)
const limit = ref(10)
</script>

<template>
  <Demo>
    <div class="flex gap-3">
      <XPagination
        v-model="page"
        v-model:limit="limit"
        :total="100"
        :layouts="['prev', 'pager', 'next', 'sizes']"
        :sizes="[10, 20, 30, 40, 50]"
      />
    </div>
  </Demo>
</template>
