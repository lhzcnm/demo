<script setup lang="ts">
interface Props {
  content: string
  title?: string
}

const props = defineProps<Props>()
const visible = ref(false)

function open() {
  visible.value = true
}
</script>

<template>
  <XButton label="查看文本" variant="ghost" size="sm" @click="open" />
  <XDialog v-model="visible" :title="props.title" ui-root="sm:max-w-2xl">
    <template #default>
      <div
        class="tiptap text-sm leading-relaxed text-foreground"
        v-html="props.content"
      />
    </template>
    <!-- <template #footer>
      <XButton label="关闭" variant="soft" @click="visible = false" />
    </template> -->
  </XDialog>
</template>
