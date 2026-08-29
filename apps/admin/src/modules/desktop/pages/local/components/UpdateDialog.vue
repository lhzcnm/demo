<script setup lang="ts">
import { localApi } from '@/api/local';
import { useLocalStore } from '../utils/store.ts'
import { toast } from 'vue-sonner';
import FormBase from './FormBase.vue';

const store = useLocalStore()

async function updateLocal() {
  try {
    
    const params = store.updateForm
    const res = await localApi.putLocal(params)
    store.getData()
    toast.success(res.data)
    store.localDialog.updateDialog = false

  } catch (e) {

  } finally {
  }
}
</script>

<template>
  <XDialog v-model="store.localDialog.updateDialog" ui-root="p-0 sm:p-0 sm:max-w-[450px]"
    ui-header="pt-4 px-4 dark:text-gray-400" title="编辑前台中英文" draggable>
    
    <FormBase v-model="store.updateForm"/>
    <div class="flex justify-end gap-3 mt-auto border-t px-4 select-none">
      <div class="py-4 ml-auto space-x-2">
        <XButton variant="soft" @click="store.localDialog.updateDialog = false">取消</XButton>
        <XButton @click="updateLocal">编辑</XButton>
      </div>
    </div>
  </XDialog>
</template>