<script setup lang="ts">
interface LinkProps {
  to: string
  label?: string
}

defineProps<LinkProps>()
</script>

<template>
  <RouterLink
    class="py-0.5 px-1.5 capitalize text-sm border rounded hover:ring-1 hover:ring-primary"
    exact-active-class="bg-primary rounded text-white border-none"
    :to="to"
  >
    <slot>{{ label }}</slot>
  </RouterLink>
</template>
