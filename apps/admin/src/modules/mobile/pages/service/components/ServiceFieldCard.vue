<script setup lang="ts">
import { type ServiceFieldSyncItem } from '@/inters/services'
import { handleInputNumberChange } from '@/utils';

const field = defineModel<ServiceFieldSyncItem>({ required: true })
</script>

<template>
  <div class="rounded-lg border bg-card shadow-sm">
    <div class="divide-y relative">
      <!-- 基础信息 -->
      <div class="p-4">
        <div class="mb-4 text-sm font-medium">
          基础信息
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <XFormField
            ui-root="py-0"
            variant="vertical"
            label="中文"
          >
            <XInput
              v-model="field.name"
              placeholder="中文"
            />
          </XFormField>

          <XFormField
            ui-root="py-0"
            variant="vertical"
            label="英文"
          >
            <XInput
              v-model="field.nameEn"
              placeholder="英文"
            />
          </XFormField>
        </div>
      </div>

      <!-- 显示配置 -->
      <div class="p-4">
        <div class="mb-4 text-sm font-medium">
          显示配置
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <XFormField
            ui-root="py-0"
            variant="vertical"
            label="字段宽度"
          >
            <XInput
              v-model="field.width"
              placeholder="字段宽度"
              @input="(e: Event) => field.width = handleInputNumberChange(e, 0)!"
              @change="(e: Event) => field.width = handleInputNumberChange(e, 0)!"
            />
          </XFormField>

          <XFormField
            ui-root="py-0"
            variant="vertical"
            label="字段排序"
          >
            <XInputNumber
              v-model="field.sortNum"
              :step="1"
              :precision="0"
            />
          </XFormField>

          <XFormField
            ui-root="py-0"
            variant="vertical"
            label="启用状态"
          >
            <div class="flex h-9 items-center gap-2">
              <XSwitch
                v-model="field.status"
                :active-value="1"
                :inactive-value="0"
              />

              <span class="text-sm text-muted-foreground">
                {{ field.status ? '已启用' : '已停用' }}
              </span>
            </div>
          </XFormField>
        </div>
      </div>

      <div
        v-if="field.isDelete"
        class="absolute inset-0 z-10 rounded-lg bg-background/80 backdrop-blur-[1px]"
      />

      <div
        v-if="field.isDelete"
        class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      >
        <span class="rotate-[-8deg] select-none text-3xl font-bold text-danger/80">
          已被删除
        </span>
      </div>
    </div>

    <!-- 操作 -->
    <div class="flex items-center justify-between bg-muted/20 px-4 py-3">
      <span class="text-xs text-muted-foreground">
        字段操作
      </span>

      <XButton
        v-show="!field.isDelete"
        label="删除字段"
        color="danger"
        size="sm"
        @click="field.isDelete = true"
      />

      <XButton
        v-show="field.isDelete"
        label="取消删除字段"
        color="warning"
        size="sm"
        @click="field.isDelete = false"
      />
    </div>
  </div>
</template>
