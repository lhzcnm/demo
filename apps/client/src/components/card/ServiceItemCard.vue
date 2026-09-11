<script setup lang="ts">
import { serviceApi, type ServiceView } from '@/api/services'
import { ua } from '@3un/utils'
import { twJoin } from 'tailwind-merge'

interface ServuceItemCardEmits {
  updateService: []
}
interface ServuceItemCardProps {
  data: ServiceView
  favoriteIds?: number[]
}

const { data, favoriteIds } = defineProps<ServuceItemCardProps>()

const emits = defineEmits<ServuceItemCardEmits>()

const favoriteBool = ref<boolean>(true)

const localStore = useLocalStore()

async function favoriteClick(serviceId: number | undefined) {
  try {
    const res = await serviceApi.favorite(serviceId)
    favoriteBool.value = res.data.includes(data.id)
    emits('updateService')
  } catch {
  }
}

onMounted(() => {
  if (!favoriteIds) return
  favoriteBool.value = favoriteIds.includes(data.id)
})
</script>

<template>
  <a
    href="javascript:void(0)"
    :class="twJoin(
      'block p-2 bg-card space-y-1',
      'hover:border-primary hover:bg-border/60',
      'border border-border rounded-lg transition-colors flex flex-col justify-evenly')"
  >
    <div class="flex items-center justify-between space-x-2">
      <h3 class="flex items-center space-x-2">
        <span class="font-bold" v-html="data.idHighlight || data.id" />
        <span
          v-if="data.isNew"
          :class="twJoin(
            'px-2 py-0.5 text-xs font-semibold text-white',
            'bg-gradient-to-b from-primary to-blue-600 rounded-full shadow-sm'
          )"
        >
          {{ localStore.localData['home_New'] }} !
        </span>
      </h3>
      <div class="flex justify-end text-xs">
        <XTag color="danger">{{ localStore.localData['history_TableHeadPoints'] }}: {{ data.price }}</XTag>
        <XTag color="success" class="ml-1">{{ data.taken }}</XTag>
      </div>
    </div>

    <div class="flex justify-between">
      <div
        class="text-sm text-muted-foreground mt-1 text-ellipsis overflow-hidden"
        v-html="data.title"
      />

      <XButton
        v-if="ua.isMobile"
        :icon="favoriteBool ? 'tabler:star-filled' : 'tabler:star'"
        @click.stop="favoriteClick(data.id)"
        :variant="favoriteBool ? 'soft' : 'outline'"
        :color="favoriteBool ? 'warning' : 'primary'" size="sm"
      >
        {{ 
          favoriteBool
            ? localStore.localData['top_FavoritedYes']
            : localStore.localData['top_Favorited']
        }}
      </XButton>
    </div>
  </a>
</template>
