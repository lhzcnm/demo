<script setup lang="ts">
const options = [
  { label: '查看', icon: 'lucide:eye' },
  { label: '刷新', icon: 'lucide:refresh-cw' },
  ,
  { label: '删除', icon: 'lucide:trash' },
]

function handleClick() {
  console.log('点击')
}
</script>

<template>
  <Demo>
    <div class="flex items-center gap-2">
      <XButtonSplit icon="lucide:edit" label="编辑" :options="options" @click="handleClick" />
      <XButtonSplit icon="lucide:edit" label="编辑" size="sm" :options="options" />
    </div>
  </Demo>
</template>
