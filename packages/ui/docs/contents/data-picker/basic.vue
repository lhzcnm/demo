<script setup lang="ts">
const startDate = ref()
const endDate = ref()
</script>

<template>
  <Demo>
    <div class="flex gap-3">
      <XDateRangePicker
        v-model:start="startDate"
        v-model:end="endDate"
        :label-format="'YYYY-MM-DD'"
      />

      <XDatePicker
        v-model="startDate"
      />
    </div>
  </Demo>
</template>
