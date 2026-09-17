<script setup lang="ts">
import { type NoticeCreate } from '@/inters/notice'
import RichEditor from '@/components/RichEditor.vue'

const form = defineModel<NoticeCreate>({ required: true })
</script>

<template>
  <form class="space-y-4" @submit.prevent>
    <!-- 启用状态 -->
    <FormField label="启用状态" desc="" class="p-0">
      <XSwitch :model-value="form.status === 1" @update:model-value="form.status = $event ? 1 : 0" class="ml-auto" />
    </FormField>

    <hr class="border-border">

    <!-- 中英文两列 -->
    <div class="grid grid-cols-2 gap-4">
      <!-- 左列：中文 -->
      <div class="">
        <p class="text-sm font-medium text-muted-foreground">中文</p>
        <FormField label="公告标题" desc="" variant="vertical" required class="p-0">
          <XInput placeholder="请输入中文公告标题" v-model="form.title" />
        </FormField>
        <FormField label="公告内容" desc="支持富文本编辑" variant="vertical">
          <RichEditor v-model="form.content" />
        </FormField>
      </div>

      <!-- 右列：英文 -->
      <div class="">
        <p class="text-sm font-medium text-muted-foreground">英文</p>
        <FormField label="公告标题(En)" desc="" variant="vertical" class="p-0">
          <XInput placeholder="请输入英文公告标题" v-model="form.titleEn" />
        </FormField>
        <FormField label="公告内容(En)" desc="支持富文本编辑" variant="vertical">
          <RichEditor v-model="form.contentEn" />
        </FormField>
      </div>
    </div>
  </form>
</template>
