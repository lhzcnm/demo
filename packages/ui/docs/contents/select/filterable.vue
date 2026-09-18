<script setup lang="ts">
const value = ref()
const search = ref('')

const options = [
  { value: 1, label: 'Option 1' },
  { value: 2, label: 'Option 2' },
  { value: 3, label: 'Option 3' },
]

const filteredOptions = computed(() => {
  if (!search.value.trim()) return options
  const trimmedSearch = search.value.trim().toLowerCase()
  return options.filter(option => option.label.toLowerCase().includes(trimmedSearch))
})
</script>

<template>
  <Demo>
    <XSelect
      v-model="value" v-model:input="search"
      filterable ui-trigger="w-48" ui-input="w-48"
    >
      <XSelectItem
        v-for="option in filteredOptions"
        :key="option.value" :value="option.value"
      >
        {{ option.label }}
      </XSelectItem>
    </XSelect>
  </Demo>
</template>
