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
        :total="100"
        :layouts="[
          'total',
          'prev', 'pager', 'next',
          'sizes', 'jumper'
        ]"
      />
    </div>
  </Demo>
</template>
