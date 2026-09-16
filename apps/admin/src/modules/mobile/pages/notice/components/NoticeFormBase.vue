<script setup lang="ts">
import { type NoticeCreate } from '@/inters/notice'
import RichEditor from '@/components/RichEditor.vue'

const form = defineModel<NoticeCreate>({ required: true })
</script>

<template>
  <form class="divide-y" @submit.prevent>
    <FormField label="启用状态" desc="">
      <XSwitch :model-value="form.status === 1" @update:model-value="form.status = $event ? 1 : 0" class="ml-auto" />
    </FormField>

    <FormField label="中文标题" desc="" variant="vertical" required>
      <XInput placeholder="请输入中文公告标题" v-model="form.title" />
    </FormField>

    <FormField label="英文标题" desc="" variant="vertical">
      <XInput placeholder="Enter English title" v-model="form.titleEn" />
    </FormField>

    <FormField label="中文内容" desc="支持富文本编辑" variant="vertical">
      <RichEditor v-model="form.content" />
    </FormField>

    <FormField label="英文内容" desc="Rich text supported" variant="vertical">
      <RichEditor v-model="form.contentEn" />
    </FormField>
  </form>
</template>
