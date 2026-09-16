<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { Notice } from '@/inters/notice'
import { NOTICE_STORE } from '../utils'
import { updateNotice } from '@/api/notice'

interface Props {
  row: Notice
}

const props = defineProps<Props>()
const store = inject(NOTICE_STORE)!

const enabled = computed(() => props.row.status === 1)

async function handleChange(val: boolean) {
  try {
    await updateNotice({
      id: props.row.id,
      title: props.row.title,
      titleEn: props.row.titleEn,
      content: props.row.content,
      contentEn: props.row.contentEn,
      status: val ? 1 : 0,
    })
    toast.success(val ? "已启用" : "已禁用")
    store.refresh = !store.refresh
  } catch { }
}
</script>

<template>
  <XSwitch :model-value="enabled" @update:model-value="handleChange" />
</template>
