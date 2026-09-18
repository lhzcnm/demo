<script setup lang="ts">
const visible = ref(false)
</script>

<template>
  <Demo>
    <div class="flex gap-3">
      <XPopover v-model="visible" trigger="hover">
        <template #trigger>
          <XButton>Popover</XButton>
        </template>

        <form class="flex flex-col gap-3 p-4" @submit.prevent>
          <div class="flex flex-col gap-1">
            <label class="text-sm" for="name">Name</label>
            <XInput type="text" placeholder="Enter your name" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm" for="email">Email</label>
            <XInput type="email" placeholder="Enter your email" />
          </div>
          <div class="flex justify-end gap-3 mt-1">
            <XButton size="sm" @click="visible = false" variant="soft">Cancel</XButton>
            <XButton size="sm" @click="visible = false">Submit</XButton>
          </div>
        </form>
      </XPopover>
    </div>
  </Demo>
</template>
