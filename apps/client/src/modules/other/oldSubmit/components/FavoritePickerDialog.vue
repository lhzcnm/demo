<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { serviceApi, type ServiceDetail } from '@/api/services'
import { getCommonList } from '@/utils'
import { toast } from 'vue-sonner'

interface FavoritePickerProps {
  favoriteIds: number[]
}

interface FavoritePickerEmits {
  (e: 'close'): void
  (e: 'refresh'): void
}

const props = defineProps<FavoritePickerProps>()
const emits = defineEmits<FavoritePickerEmits>()

const serviceStore = useServiceStore()
const localStore = useLocalStore()
const visible = ref(true)
const loading = ref(false)
const search = ref('')
const expandedGroups = ref<Set<number>>(new Set())
const internalIds = ref<number[]>([...props.favoriteIds])

watch(
  () => props.favoriteIds,
  (val) => {
    internalIds.value = [...val]
  },
)

/**
 * 关键字搜索
 */
const filteredGroups = computed<ServiceDetail[]>(() => {
  const kw = search.value.trim().toLowerCase()
  if (!kw) return serviceStore.details

  const matched: ServiceDetail[] = []
  for (const group of serviceStore.details) {
    const children = group.children.filter(
      (s) => String(s.id).includes(kw) || s.title.toLowerCase().includes(kw),
    )
    if (children.length > 0) {
      matched.push({ ...group, children })
      expandedGroups.value.add(group.id)
    }
  }
  return matched
})

/**
 * 右侧常用服务列表
 */
const commonServices = computed(() => getCommonList(serviceStore.services))

/** 判断服务是否已收藏 */
function isFavorite(id: number) {
  return internalIds.value.includes(id)
}

/**
 * 切换服务收藏状态
 */
async function toggleFavorite(serviceId: number) {
  try {
    loading.value = true
    const wasFavorited = isFavorite(serviceId)
    const res = await serviceApi.favorite(serviceId)
    internalIds.value = Array.isArray(res.data) ? res.data : []
    emits('refresh')
    toast.success(wasFavorited ? localStore.localData['submit_Remove'] : localStore.localData['submit_Favorite'])
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

/**
 * 一键将所有常用服务添加到收藏
 * 逐个调用收藏接口（仅添加未收藏的），并即时同步内部列表与父组件
 */
async function applyCommonServices() {
  const toAdd = commonServices.value
    .filter((s) => !isFavorite(s.id))
    .map((s) => s.id)

  if (toAdd.length === 0) {
    return
  }

  try {
    loading.value = true
    let currentIds = [...internalIds.value]
    for (const id of toAdd) {
      const res = await serviceApi.favorite(id)
      currentIds = Array.isArray(res.data) ? res.data : []
    }
    internalIds.value = currentIds
    emits('refresh')
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

/** 切换服务组展开/折叠 */
function toggleGroup(groupId: number) {
  const set = new Set(expandedGroups.value)
  if (set.has(groupId)) {
    set.delete(groupId)
  } else {
    set.add(groupId)
  }
  expandedGroups.value = set
}

/** 弹窗关闭时通知父组件 */
function handleClose() {
  visible.value = false
  emits('close')
}

/** 初始化：默认展开所有服务组 */
onMounted(() => {
  for (const group of serviceStore.details) {
    expandedGroups.value.add(group.id)
  }
})
</script>

<template>
  <XDialog
    v-model="visible"
    :title="localStore.localData['submit_AddFavoriteService']"
    :maskClosable="false"
    uiRoot="w-[95vw] max-w-[95vw] sm:max-w-4xl h-[600px] z-[70] text-[9px] md:text-sm"
    @close="handleClose"
  >
    <div class="flex flex-col md:flex-row gap-1 md:gap-2 p-1 md:p-2 h-full">

       <!--常用服务（点击添加） -->
      <div class="flex-1 flex flex-col border border-border rounded min-w-0">
        <div class="p-1 md:p-2 border-b border-border bg-gray-50 dark:bg-black flex items-center justify-between gap-2">
          <span class="font-bold text-[9px] md:text-sm truncate">{{ localStore.localData['submit_DefaultService'] }}</span>
          <XButton :loading="loading" @click="applyCommonServices" :label="localStore.localData['submit_ApplyDefaultService']" size="sm"/>
        </div>
        <div class="flex-1 overflow-y-auto h-full text-[9px] md:text-sm">
          <div
            v-for="service in commonServices"
            :key="service.id"
            class="flex items-center gap-1 md:gap-2 p-1 md:p-2 border-b border-border"
          >
            <span class="font-bold whitespace-nowrap">{{ service.id }}</span>
            <span class="flex-1 min-w-0 truncate">{{ service.title }}</span>
            <span class="text-red-500 whitespace-nowrap">{{ service.price }}</span>
            <span
              v-if="isFavorite(service.id)"
              class="text-[9px] md:text-xs text-yellow-500 whitespace-nowrap"
            >
              {{  localStore.localData['submit_Favoritess'] }}
            </span>
          </div>
          <div v-if="commonServices.length === 0" class="p-4 text-center text-gray-400">
            {{ localStore.localData['submit_NoServicesAdded'] }}
          </div>
        </div>
      </div>
      <!-- 全部服务（带勾选框） -->
      <div class="flex-1 flex flex-col border border-border rounded min-w-0">
        <div class="p-1 md:p-2 flex justify-between items-center border-b border-border bg-gray-50 dark:bg-black">
          <span class="font-bold text-[9px] md:text-sm truncate">{{ localStore.localData['submit_CheckAddFavoriteService'] }}</span>
          <div class="relative">
            <Icon icon="tabler:search" class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="search"
              type="text"
              :placeholder="localStore.localData['submit_SearchServiceName']"
              class="w-full pl-8 pr-2 py-1 text-[9px] md:text-sm border border-border rounded bg-white dark:bg-black focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div class="overflow-y-auto h-full text-[9px] md:text-sm">
          <template v-for="group in filteredGroups" :key="group.id">
            <div
              @click="toggleGroup(group.id)"
              class="flex items-center justify-between p-1 md:p-2 text-blue-600 font-bold cursor-pointer border-b border-border hover:bg-gray-500/20 select-none"
            >
              <span class="truncate">{{ group.title }}</span>
              <Icon
                :icon="expandedGroups.has(group.id) ? 'tabler:chevron-down' : 'tabler:chevron-right'"
                class="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform flex-shrink-0"
              />
            </div>
            <template v-if="expandedGroups.has(group.id)">
              <label
                v-for="service in group.children"
                :key="service.id"
                class="flex items-center gap-1 md:gap-2 p-1 md:p-2 border-b border-border cursor-pointer hover:bg-gray-500/20"
              >
                <input
                  type="checkbox"
                  :checked="isFavorite(service.id)"
                  :disabled="loading"
                  class="w-3.5 h-3.5 md:w-4 md:h-4 accent-blue-500 flex-shrink-0"
                  @change="toggleFavorite(service.id)"
                />
                <span class="font-bold whitespace-nowrap">{{ service.id }}</span>
                <span class="flex-1 min-w-0 truncate">{{ service.title }}</span>
                <span class="text-red-500 whitespace-nowrap">{{ service.price }}</span>
              </label>
            </template>
          </template>
          <div v-if="filteredGroups.length === 0" class="p-4 text-center text-gray-400">
            {{ localStore.localData['submit_NoMatchingServices'] }}
          </div>
        </div>
      </div>
    </div>
  </XDialog>
</template>
