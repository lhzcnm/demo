<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { serviceApi, type ServiceDetail } from '@/api/services'
import submit from './oldSubmit/submit.vue'
import FavoritePickerDialog from './oldSubmit/components/FavoritePickerDialog.vue'

const uStore = useUserStore()
const serviceStore = useServiceStore()
const localStore = useLocalStore()

const route = useRoute()
const router = useRouter()

const showFavorites = ref(false)
const sidebarExpanded = ref(true)
const ready = ref(false)
const showFavoritePicker = ref(false)

const favoriteIds = ref<number[]>([])
const selectedServiceId = ref<number | null>(null)
const searchKeyword = ref('')
const expandedGroups = ref<Set<number>>(new Set())

/**
 * 全部服务列表
 * 根据搜索关键字过滤服务，匹配 ID 或标题
 */
const filteredServices = computed<ServiceDetail[]>(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return serviceStore.details

  const matched: ServiceDetail[] = []
  for (const group of serviceStore.details) {
    const children = group.children.filter(s =>
      String(s.id).includes(kw) || s.title.toLowerCase().includes(kw)
    )
    if (children.length > 0) {
      matched.push({ ...group, children })
      expandedGroups.value.add(group.id)
    }
  }
  return matched
})

/**
 * 搜索模式下的平铺服务列表
 * 将匹配到的服务按组展开为平铺列表
 */
const searchFlattenedServices = computed(() => {
  const list: ServiceDetail['children'] = []
  for (const group of filteredServices.value) {
    list.push(...group.children)
  }
  return list
})

/**
 * 收藏服务列表
 * 从所有服务中筛选出已收藏的服务
 */
const favoriteServices = computed(() => {
  const list: ServiceDetail['children'] = []
  for (const group of serviceStore.details) {
    for (const s of group.children) {
      if (favoriteIds.value.includes(s.id)) list.push(s)
    }
  }
  return list
})

/**
 * 切换服务组的展开/折叠状态
 */
function toggleGroup(groupId: number) {
  const set = new Set(expandedGroups.value)
  if (set.has(groupId)) {
    set.delete(groupId)
  } else {
    set.add(groupId)
  }
  expandedGroups.value = set
}

/**
 * 查找默认选中的服务 ID
 * 优先返回收藏列表的第一个，无收藏则返回全部服务的第一个
 */
function findFirstServiceId() {
  for (const group of serviceStore.details) {
    for (const s of group.children) {
      if (favoriteIds.value.includes(s.id)) return s.id
    }
  }
  for (const group of serviceStore.details) {
    if (group.children.length > 0) return group.children[0].id
  }
  return null
}

/**
 * 加载收藏列表
 */
async function loadFavorites() {
  try {
    const res = await serviceApi.favorite(undefined)
    favoriteIds.value = Array.isArray(res.data) ? res.data : []
  } catch {
  }
}

/**
 * 提供给子组件（submitView）的收藏列表刷新方法
 * 子组件收藏/取消收藏成功后调用，使侧边栏收藏列表实时同步
 */
provide('reloadFavorites', loadFavorites)

/**
 * 点击「收藏服务」Tab，切换到收藏服务视图
 * 弹窗的自动打开由 watch(showFavorites) 处理
 */
function handleFavoritesTabClick() {
  showFavorites.value = true
}

/**
 * 监听收藏服务视图切换
 * 进入收藏服务 Tab 时若收藏列表为空，自动弹出收藏选择弹窗
 */
watch(showFavorites, (val) => {
  if (val && favoriteServices.value.length === 0) {
    showFavoritePicker.value = true
  }
})

/**
 * 选择服务
 */
function handleServiceSelect(serviceId: number) {
  selectedServiceId.value = serviceId
  router.push(`/oldSubmit/${serviceId}`)
}

/**
 * 监听路由参数变化，同步选中的服务 ID
 */
watch(
  () => route.params.id,
  (id) => {
    if (id) selectedServiceId.value = Number(id)
  },
  { immediate: true }
)

/** 侧边栏 DOM 引用，用于判断点击位置是否在侧边栏内部 */
const asideRef = ref<HTMLElement | null>(null)

/**
 * 全局点击处理
 * 仅手机端有收缩/展开功能，PC 端固定宽度不受影响
 */
function handleDocClick(e: MouseEvent) {
  if (window.matchMedia('(min-width: 768px)').matches) return
  sidebarExpanded.value = asideRef.value?.contains(e.target as Node) ?? false
}

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))

/**
 * 组件挂载时初始化数据
 */
onMounted(async () => {
  await Promise.all([
    uStore.getInfo(),
    serviceStore.getServices(),
    loadFavorites()
  ])

  const firstId = findFirstServiceId()
  if (firstId) {
    showFavorites.value = favoriteServices.value.length > 0
    selectedServiceId.value = firstId
    await router.replace(`/oldSubmit/${firstId}`)
  }

  ready.value = true
})
</script>

<template>
  <div class="flex flex-col h-screen touch-manipulation text-[9px] md:text-[14px] "
    style="touch-action: pan-x pan-y pinch-zoom">
    <!-- 顶部状态栏 -->
    <header
      class=" flex items-center justify-between pl-2 md:pl-4 py-1.5 border-b  text-sm text-black dark:text-white">
      <!-- 用户信息区域 -->
      <div class=" flex flex-wrap items-center gap-x-1 md:gap-4 text-[13px] md:text-[14px]">
        <div class="flex items-center gap-1">
          <span>{{ localStore.localData['submit_old_Points'] }}: </span>
          <div class="text-blue-500 font-bold mr-1">{{ uStore.info.credits }}</div>
          <XButton icon="hugeicons:money-bag-02" @click="router.push('/recharge')" variant="soft" :label="localStore.localData['submit_old_Recharge']" size="sm" />
          <XButton icon="lets-icons:order" @click="router.push('/history')" variant="soft" :label="localStore.localData['submit_OrdersHistory']" size="sm" />
        </div>
      </div>

      <!-- 右侧操作按钮 -->
      <div class="flex items-center gap-1 md:gap-3">
        <LanguageSwitch />
        <TheTheme ghost />
        <div @click="router.push('/submit')"
          class="cursor-pointer flex bg-blue-500/20 p-2 pl-3 items-center rounded-l-full text-blue-500 text-xs md:text-[14px] whitespace-nowrap">
          <div>{{ localStore.localData['submit_old_return'] }}</div>
          <Icon icon="raphael:arrowleft" class="rotate-180" />
        </div>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="flex flex-1 min-h-0">
      <!-- 侧边栏（手机端点击展开/收缩，PC 端固定宽度） -->
      <aside ref="asideRef" class="flex-shrink-0 overflow-hidden  flex flex-col border-r border-border "
        :class="[sidebarExpanded ? 'w-40' : 'w-20', 'md:w-64']">
        <!-- Tab 切换（宽度不够时 Tab 整体换行） -->
        <div class="flex flex-wrap items-center justify-center border-b border-border">
          <button @click="showFavorites = false" :class="[
            'flex-1 min-w-20 p-2 text-[9px] md:text-sm font-medium transition-colors',
            !showFavorites
              ? 'text-blue-600  bg-blue-500/20 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          ]">
            {{ localStore.localData['submit_old_allService'] }}
          </button>
          <button @click="handleFavoritesTabClick" :class="[
            'flex-1 min-w-20 p-2 text-[9px] md:text-sm font-medium transition-colors',
            showFavorites
              ? 'text-blue-600  bg-blue-500/20 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          ]">
            {{ localStore.localData['submit_old_FavoriteServices'] }}
          </button>
        </div>

        <!-- 搜索框 -->
        <div v-if="!showFavorites" class="p-1 border-b border-border">
          <div class="relative">
            <!-- <Icon icon="tabler:search" class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /> -->
            <input v-model="searchKeyword" type="text"
              :placeholder="localStore.localData['submit_old_searchServiceInput']"
              class="w-full pl-1 pr-6 py-2 text-[9px] md:text-sm border border-border rounded bg-white dark:bg-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200" />
            <button v-if="searchKeyword" @click="searchKeyword = ''"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <Icon icon="tabler:x" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- 服务列表 -->
        <div
          class="flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <!-- 收藏服务 -->
          <template v-if="showFavorites">
            <!-- 添加收藏服务按钮（固定在列表最上方） -->
            <div class="sticky top-0 z-10 p-1 border-b border-border bg-white dark:bg-black">
              <button @click="showFavoritePicker = true"
                class="w-full p-1 rounded-md text-[9px] md:text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600">
                {{ localStore.localData['submit_AddFavoriteService'] }}
              </button>
            </div>
            <div v-for="service in favoriteServices" :key="service.id" @click="handleServiceSelect(service.id)" :class="[
              'flex items-center gap-1 p-1 cursor-pointer border-b border-border overflow-hidden transition-colors',
              selectedServiceId === service.id
                ? 'bg-blue-500 text-white'
                : 'text-muted-foreground hover:bg-blue-50'
            ]">
              <span class="font-bold  text-[9px] md:text-sm">{{ service.id }}</span>
              <span class=" flex-1 text-[9px] md:text-sm">{{ service.title }}</span>
              <span v-show="sidebarExpanded" class="whitespace-nowrap text-[9px] md:text-sm"
                :class="selectedServiceId === service.id ? 'text-gray-200' : 'text-red-500'">{{ service.price }}</span>
            </div>
            <div v-if="favoriteServices.length === 0" class="px-4 py-8 text-center text-sm text-gray-400">
              {{ localStore.localData['submit_NoServicesAdded'] }}
            </div>
          </template>

          <!-- 全部服务 -->
          <template v-else>
            <!-- 搜索模式：平铺显示 -->
            <template v-if="searchKeyword.trim()">
              <div v-for="service in searchFlattenedServices" :key="service.id" @click="handleServiceSelect(service.id)"
                :class="[
                  'flex items-center gap-1 p-1 cursor-pointer border-b border-border overflow-hidden transition-colors',
                  selectedServiceId === service.id
                    ? 'bg-blue-600 text-white'
                    : 'text-muted-foreground hover:bg-blue-50'
                ]">
                <span class="font-bold text-[9px] md:text-sm">{{ service.id }}</span>
                <span class=" flex-1 text-[9px] md:text-sm">{{ service.title }}</span>
                <span v-show="sidebarExpanded" class="whitespace-nowrap text-[9px] md:text-sm"
                  :class="selectedServiceId === service.id ? 'text-gray-200' : 'text-red-500'">{{ service.price
                  }}</span>
              </div>
              <div v-if="searchFlattenedServices.length === 0" class="px-4 py-8 text-center text-gray-400">
                {{ localStore.localData['submit_NoMatchingServices'] }}
              </div>
            </template>

            <!-- 非搜索模式：按组折叠显示 -->
            <template v-else>
              <template v-for="group in filteredServices" :key="group.id">
                <!-- 组标题 -->
                <div @click="toggleGroup(group.id)"
                  class="flex items-center justify-between p-1 text-blue-600 font-bold  tracking-wide border-b border-border cursor-pointer hover:bg-gray-200 select-none">
                  <span class="text-[9px] md:text-sm">{{ group.title }}</span>
                  <Icon :icon="expandedGroups.has(group.id) ? 'tabler:chevron-down' : 'tabler:chevron-right'"
                    class="w-3.5 h-3.5 transition-transform" />
                </div>

                <!-- 组内服务 -->
                <template v-if="expandedGroups.has(group.id)">
                  <div v-for="service in group.children" :key="service.id" @click="handleServiceSelect(service.id)"
                    :class="[
                      'flex items-center gap-1 p-1 cursor-pointer border-b border-border overflow-hidden transition-colors',
                      selectedServiceId === service.id
                        ? 'bg-blue-600 text-white'
                        : 'text-muted-foreground hover:bg-blue-50'
                    ]">
                    <span class="font-bold text-[9px] md:text-sm">{{ service.id }}</span>
                    <span class=" flex-1 text-[9px] md:text-sm">{{ service.title }}</span>
                    <span v-show="sidebarExpanded" class="whitespace-nowrap text-[9px] md:text-sm"
                      :class="selectedServiceId === service.id ? 'text-gray-200' : 'text-red-500'">{{ service.price
                      }}</span>
                  </div>
                </template>
              </template>

              <div v-if="filteredServices.length === 0" class="px-4 py-8 text-center text-sm text-gray-400">
                {{ localStore.localData['submit_NoMatchingServices'] }}
              </div>
            </template>
          </template>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="flex-1 min-w-0 overflow-hidden">
        <submit v-if="ready && selectedServiceId" :id="String(selectedServiceId)" imei="" />
        <div v-else class="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
          <p>{{ localStore.localData['submit_TableToast'] }}</p>
        </div>
      </main>
    </div>

    <!-- 收藏服务选择弹窗（收藏为空时弹出，供用户添加收藏） -->
    <FavoritePickerDialog v-if="showFavoritePicker" :favorite-ids="favoriteIds" @close="showFavoritePicker = false"
      @refresh="loadFavorites" />
  </div>
</template>``