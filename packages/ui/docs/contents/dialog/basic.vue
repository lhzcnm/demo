<script setup lang="ts">
const visible = ref(false)
</script>

<template>
  <Demo>
    <div class="flex gap-3">
      <XButton @click="visible = true">Open</XButton>

      <XDialog v-model="visible" title="标题">
        <p>Content</p>

        <template #footer>
          <div class="flex justify-end space-x-3 mt-3">
            <XButton @click="visible = false" variant="soft">取消</XButton>
            <XButton @click="visible = false">确定</XButton>
          </div>
        </template>
      </XDialog>
    </div>
  </Demo>
</template>
