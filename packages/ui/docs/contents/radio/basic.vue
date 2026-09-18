<script setup lang="ts">
const value = ref('1')
</script>

<template>
  <Demo>
    <XRadio v-model="value" value="1" name="radio" label="Vue" />
    <XRadio v-model="value" value="2" name="radio" label="React" />
  </Demo>
</template>
