<script setup lang="ts">
import { type NoticeSearch } from '@/inters/notice'

const form = defineModel<NoticeSearch>({ required: true, })
</script>

<template>
  <form class="space-y-4 flex flex-col" @submit.prevent>
    <div>
      <label class="text-label text-sm mb-1">公告标题</label>
      <XInput placeholder="请输入公告标题" v-model="form.title" />
    </div>
    <div>
      <label class="text-label text-sm mb-1">状态</label>
      <XSelect v-model="form.status">
        <XSelectItem :value="1" label="已启用" />
        <XSelectItem :value="0" label="已禁用" />
      </XSelect>
    </div>
  </form>
</template>
