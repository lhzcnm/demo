<script setup lang="ts">
import { useCopyFn } from '@3un/utils'
import { NOTICE_STORE } from '../utils'
import NoticeSearchForm from './NoticeSearchForm.vue'

const store = inject(NOTICE_STORE)!

const cloned = useCopyFn(() => store.formSearch)
const copied = ref(cloned())

watch(
  () => store.visibleSearch,
  (val) => val && (copied.value = cloned()),
)

function handleCancel() {
  copied.value = cloned()
  store.visibleSearch = false
}

function handleSubmit() {
  store.formSearch = copied.value
  store.visibleSearch = false
  store.refresh = !store.refresh
}
</script>

<template>
  <TheModal
    v-model="store.visibleSearch"
    title="筛选"
    class="flex flex-col"
    header-class="border-b">
    <template #default>
      <div class="p-4 flex flex-col overflow-auto">
        <NoticeSearchForm class="overflow-y-auto border-b pb-4" v-model="copied" />
        <div class="flex justify-end space-x-2 mt-2">
          <XButton variant="soft" label="取消" @click="handleCancel" />
          <XButton label="提交" @click="handleSubmit" />
        </div>
      </div>
    </template>
  </TheModal>
</template>
