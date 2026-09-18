<script setup lang="ts">
const active = ref(false)

function handleSelected(value: boolean) {
  setTimeout(() => active.value = !value, 2000)
}
</script>

<template>
  <Demo>
    <div class="flex gap-3 w-64">
      <XSwitch
        v-model="active"
        label="Switch"
        @change="handleSelected"
      />
    </div>
  </Demo>
</template>
