<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface PropType {
  isSidebar: boolean
}

const prop = defineProps<PropType>()


const localStore = useLocalStore()

function download(platform: string) {
  const baseUrl = import.meta.env.VITE_API_URL
  const type = platform === 'windows' ? 1 : 2
  location.href = `${baseUrl}/oss/download/${type}`
}
</script>

<template>
  <div class="border shadow-sm rounded-lg space-y-1 bg-zinc-100/20 dark:bg-zinc-800/50" :class="prop.isSidebar? 'p-4 py-2' : 'p-6 mr-6'">
    <!-- <h3 class="text-lg mb-4">批量查询助手</h3> -->
    <h3 class="text-center " :class="prop.isSidebar? 'text-[16px] font-bold' : 'text-lg'">{{ localStore.localData['profile_SoftwareOld'] }}</h3>

    <div :class="prop.isSidebar ? 'text-xs' : 'text-sm'" class=" text-center text-muted-foreground">{{ localStore.localData['profile_DesktopEXEDownload'] }}</div>

    <div class="whitespace-nowrap" :class="prop.isSidebar? 'flex space-y-2 flex-col' : 'space-x-2'">
      <XButton
        icon="fa-brands:windows" label="Windows"
        variant="soft"
        @click="download('windows')"
      />

      <XButton
        icon="fa-brands:apple" label="macOS"
        variant="soft" color="danger"
        @click="download('macos')"
      />
    </div>

    <div class="flex justify-end items-center text-blue-500 text-xs text-end font-medium">
      <div class="font-bold ">{{ localStore.localData['profile_ClickButton'] }}</div>
      <Icon class="size-7 flex-shrink-0" icon="game-icons:click" />
    </div>
  </div>
</template>
