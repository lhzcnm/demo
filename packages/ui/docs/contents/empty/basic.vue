<script setup lang="ts">
import noData from '~/assets/no_data.png'
</script>

<template>
  <Demo>
    <div class="my-3">
      <XEmpty :src="noData" title="暂无数据" />
    </div>
  </Demo>
</template>
