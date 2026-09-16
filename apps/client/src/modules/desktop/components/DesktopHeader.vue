<script setup lang="ts">
import TodoMsg from '@/components/TodoMsg.vue'
import { useSystemStore } from '@/stores/system'
import { Icon } from '@iconify/vue'
import { twJoin } from 'tailwind-merge'

const uStore = useUserStore()
const systemStore = useSystemStore()
const localStore=useLocalStore()

// const extras = [
//   {
//     path: "/quotation",
//     name: "extra.quote",
//     class: [
//       "inline-block px-3 py-2  bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500",
//       "text-white text-sm rounded-full shadow-lg",
//       "hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer",
//       "text-center select-none",
//     ]
//   },
//   {
//     path: "/shop/services",
//     name: "extra.shop",
//     class: [
//       "inline-block px-3 py-2 rounded-full text-sm select-none",
//       "relative overflow-hidden bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 text-white",
//       "before:absolute before:inset-0 before:bg-gradient-to-r before:from-indigo-500 before:to-sky-400 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
//       "hover:scale-105 active:scale-95 transition-transform duration-300 shadow-md cursor-pointer"
//     ]
//   },
// ]

const foldIcon = computed(() => {
  if (systemStore.showSidebar) return 'lucide:panel-left-close'
  return 'lucide:panel-left-open'
})

// function handleClick(path: string) {
//   location.href = path
// }

function goToInstruction() {
  window.open('http://docx.3unlocked.com', '_blank')
}
</script>

<template>
  <header class="w-full h-header px-4 bg-background">
    <div class="flex items-center justify-between h-full border-b border-dashed">
      <div class="flex items-center">
        <TheLogo />
        <Icon class="ml-16 mr-4 text-zinc-500 cursor-pointer" width="24" :icon="foldIcon"
          @click="systemStore.toggleSidebar" />

        <section @click="goToInstruction"
          class="flex items-center justify-center space-x-1 px-2 py-1 rounded-full shadow-md  
                hover:text-red-500 dark:hover:text-red-500 text-blue-600 dark:text-gray-50  select-none">
          <Icon icon="tdesign:error-circle" class="size-5" />
          <span class="text-md font-bold">{{ localStore.localData['top_Instructions'] }}</span>
        </section>

      </div>

      <nav class="flex items-center space-x-4">
        <!-- <button
          v-for="extra in extras"
          :class="extra.class"
          @click="handleClick(extra.path)">
          {{ t(extra.name) }}
        </button> -->

        <RouterLink to="/recharge" :class="twJoin(
          'flex items-center space-x-2 px-3 py-2 shadow',
          'bg-success text-white rounded-full'
        )">
          <Icon icon="hugeicons:bitcoin-bag" class="size-5" />
          <span class="text-sm">{{ uStore.info.credits }}</span>
        </RouterLink>

        <TodoMsg/>
        <LanguageSwitch />
        <TheTheme />
        <TheAvatar class="size-8" />

      </nav>
    </div>
  </header>
</template>
