<script setup lang="ts">
import { zNoticeForm, type Notice } from '@/inters/notice'
import { NOTICE_STORE } from '../utils'
import { xconfirm } from '@3un/utils';
import { deleteNotice, publishNotice } from '@/api/notice'
import { toast } from 'vue-sonner'

interface NoticeActionProps {
  row: Notice,
  index: number,
}

const props = defineProps<NoticeActionProps>()

const store = inject(NOTICE_STORE)!

const options = [
  {
    icon: "lucide:clipboard-edit",
    label: "编辑",
    command: openEdit,
    colors: 'primary',
    variant: 'outline'
  },
  {
    icon: "lucide:send",
    label: "发布",
    command: handlePublish,
    colors: 'success',
    variant: 'soft'
  },
  {
    icon: "lucide:trash-2",
    label: "删除",
    command: handleDelete,
    colors: 'danger',
    variant: 'soft'
  },
]

function openEdit() {
  store.index = props.index
  store.formBase = zNoticeForm.parse(props.row)
  store.visibleBase = true
}

async function handlePublish() {
  if (!await xconfirm("是否确认发布该公告？发布后前台用户将可见")) return

  try {
    await publishNotice(props.row.id)
    toast.success("发布成功")
    store.refresh = !store.refresh
  } catch { } finally {}
}

async function handleDelete() {
  if (!await xconfirm("是否确认删除该公告")) return

  try {
    await deleteNotice([props.row.id])
    toast.success("删除成功")
    store.refresh = !store.refresh
  } catch {

  } finally {}
}
</script>

<template>
  <XButton v-for="item in options" @click="item?.command()" :label="item?.label" :icon="item?.icon" :color="item.colors as any" :variant="item.variant as any"  size="sm"/>
</template>
