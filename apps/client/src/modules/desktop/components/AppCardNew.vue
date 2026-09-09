<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface PropType {
  isSidebar: boolean
}

const prop = defineProps<PropType>()

const { locale } = useI18n()

const settingStore = useSettingStore()
const localStore = useLocalStore()

const options = [
  { label: 'ARM', command: () => download(47), color: 'success' },
  { label: 'Intel', command: () => download(48), color: 'danger' },
]

const name = computed(() => {
  return locale.value === 'zh'
    ? settingStore.settings.title : settingStore.settings.titleEn
      ? settingStore.settings.titleEn : settingStore.settings.title

})

function download(platform: number) {
  const baseUrl = import.meta.env.VITE_API_URL
  location.href = `${baseUrl}/oss/download/${platform}`
}
</script>

<template>
  <div class="border shadow-sm rounded-lg space-y-1 bg-zinc-100/20 dark:bg-zinc-800/50"
    :class="prop.isSidebar ? 'p-4 py-2' : 'p-6 mr-6'">
    <!-- <h3 class="text-lg mb-4">
      三和助手 - 标签|设备信息|批量查询
    </h3> -->
    <h3 class="whitespace-pre text-center" :class="prop.isSidebar ? 'text-[16px] font-bold' : 'text-lg'">
      {{ prop.isSidebar ? localStore.localeSlotVal('profile_SoftwareNew', { '{name}': name }).slice(0, 6) :
        localStore.localeSlotVal('profile_SoftwareNew', { '{name}': name }) }}
    </h3>
    <div :class="prop.isSidebar ? 'text-xs' : 'text-sm'" class=" text-center text-muted-foreground">{{ localStore.localData['profile_DesktopEXEDownload'] }}</div>

    <div class="whitespace-nowrap  justify-center"
      :class="prop.isSidebar ? 'flex flex-col space-y-2' : 'flex space-x-2'">
      <XButton icon="fa-brands:windows" label="Windows" variant="soft" @click="download(46)" />
      <XButton v-for="item in options" icon="fa-brands:apple" :label="`MacOS(${item.label})`" variant="soft" @click="item.command" :color="item.color as any"/>
      <!-- <XButtonSplit variant="outline" icon="fa-brands:apple" :openClick="true" label="MacOS" :options="options" /> -->
    </div>

    <div class="flex justify-end items-center text-blue-500 text-xs text-end font-medium">
      <div class="font-bold">{{ localStore.localData['profile_ClickButton'] }}</div>
      <Icon class="size-7 flex-shrink-0" icon="game-icons:click" />
    </div>
  </div>
</template>
