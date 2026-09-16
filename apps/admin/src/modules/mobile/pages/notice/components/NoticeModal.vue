<script setup lang="ts">
import type { FormMode } from '@3un/shared'
import { toast } from 'vue-sonner'
import { xconfirm } from '@3un/utils'

import { NOTICE_STORE } from '../utils'
import NoticeFormBase from './NoticeFormBase.vue'
import { createNotice, updateNotice } from '@/api/notice'

const store = inject(NOTICE_STORE)!

const options = {
  create: {
    title: "新增公告",
    submitText: "新增"
  },
  update: {
    title: "编辑公告",
    submitText: "保存",
  },
}

const isCreate = computed(() => store.index === undefined)
const mode = computed<FormMode>(() => isCreate.value ? "create" : "update")

async function handleSubmit() {
  const { title, titleEn, content, contentEn } = store.formBase

  if (!title) {
    toast.warning("请填写需要新增的公告")
    return
  }

  const missing: string[] = []
  if (!content) missing.push("中文公告内容")
  if (!titleEn) missing.push("英文公告标题")
  if (!contentEn) missing.push("英文公告内容")

  if (missing.length > 0) {
    const msg = `以下内容未填写，是否继续提交？\n${missing.map(m => `· ${m}`).join("\n")}`
    if (!await xconfirm(msg)) return
  }

  if (isCreate.value) await handleCreate()
  else await handleUpdate()
}

async function handleCreate() {
  try {
    await createNotice(store.formBase)
    toast.success("添加成功")
    store.refresh = !store.refresh
  } catch { } finally {
    store.visibleBase = false
  }
}

async function handleUpdate() {
  const id = store.notices[store.index!].id

  try {
    await updateNotice({
      ...store.formBase,
      id: id,
    })
    toast.success("更新成功")
    store.refresh = !store.refresh
  } catch { } finally {
    store.visibleBase = false
  }
}
</script>

<template>
  <TheModal
    :title="options[mode].title"
    v-model="store.visibleBase"
    class="flex flex-col"
    header-class="border-b">
    <template #default>
      <div class="px-4 py-3 flex flex-col overflow-y-auto">
        <NoticeFormBase class="flex-1 border-b pb-4 overflow-y-auto overflow-x-hidden" v-model="store.formBase" />
        <div class="flex justify-end gap-2 mt-2">
          <XButton variant="soft" label="取消" @click="store.visibleBase = false" />
          <XButton label="提交" @click="handleSubmit" />
        </div>
      </div>
    </template>
  </TheModal>
</template>
