<script setup lang="ts">
const active = ref(false)
const flag = false

const handleSelected = (value: boolean) => {
  if (!flag) active.value = !value
}
</script>

<template>
  <Demo>
    <div class="flex gap-3">
      <XSwitch v-model="active" @selected="handleSelected" />
      <XSwitch label="Switch" />
    </div>
  </Demo>
</template>
