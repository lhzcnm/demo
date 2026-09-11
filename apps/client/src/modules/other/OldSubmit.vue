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

const showFavorites = ref(true)
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
      class="relative flex items-center justify-between py-2 md:py-2.5 border-b border-slate-200 dark:border-slate-800 text-sm text-black dark:text-white select-none  backdrop-blur-xl z-20">

      <!-- 用户信息区域 -->
      <div class="relative flex flex-wrap items-center gap-x-1 md:gap-2 text-[13px] md:text-[14px]">
        <!-- 返回首页 -->
        <div @click="router.push('/submit')"
          class="group cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-r-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs md:text-sm font-medium transition-all">
          <Icon icon="tabler:arrow-left" class="size-5 transition-transform group-hover:-translate-x-0.5" />
          <span>{{ localStore.localData['submit_old_return'] }}</span>
        </div>

        <div class="flex items-center gap-1">
          <!-- 余额 -->
          <div @click="router.push('/recharge')"
            class="group flex items-center  px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
            <Icon icon="tabler:coins" class="w-4 h-4 text-emerald-500 mr-1" />
            <span class="text-[13px] md:text-sm font-semibold text-emerald-500 dark:text-emerald-400">{{
              uStore.info.credits }} </span>
            <span class="group-hover:text-blue-500 text-[13px] md:text-sm text-emerald-500 dark:text-emerald-400">({{
              localStore.localData['submit_old_Recharge'] }}) </span>
          </div>

          <div @click="router.push('/history')"
            class="group flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 border border-sky-200/50 dark:border-sky-800/50">
            <Icon icon="lets-icons:order" class="w-4 h-4 text-sky-500 group-hover:text-blue-500 " />
            <span class="group-hover:text-blue-500 text-[13px] md:text-sm text-sky-500 dark:text-sky-400">{{
              localStore.localData['submit_OrdersHistory'] }} </span>
          </div>
        </div>
      </div>

      <!-- 右侧操作按钮 -->
      <div class="relative flex items-center gap-1 md:gap-3 px-2">
        <LanguageSwitch />
        <TheTheme ghost />
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="flex flex-1 min-h-0">
      <!-- 侧边栏 -->
      <aside ref="asideRef"
        class="relative flex-shrink-0 overflow-hidden flex flex-col border-r border-slate-200 dark:border-slate-800 select-none transition-all duration-300"
        :class="[sidebarExpanded ? 'w-40' : 'w-20', 'md:w-64']">

        <!-- Tab 切换 -->
        <div class="flex p-2 gap-1.5 border-b border-slate-100 dark:border-slate-800 mt-1">
          <button @click="handleFavoritesTabClick" :class="[
            'group relative flex-1 min-w-0 px-1 py-2 text-[9px] md:text-sm font-medium transition-all rounded-xl flex items-center justify-center gap-1.5 overflow-hidden',
            showFavorites
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]">
            <Icon icon="tabler:star" class="w-3.5 h-3.5 flex-shrink-0" />
            <span class="truncate" :class="sidebarExpanded ? 'inline' : 'hidden md:inline'">{{ localStore.localData['submit_old_FavoriteServices'] }}</span>
            <div v-if="showFavorites" class="absolute inset-0 bg-white/10 blur-sm pointer-events-none"></div>
          </button>

          <button @click="showFavorites = false" :class="[
            'group relative flex-1 min-w-0 px-1 py-2 text-[9px] md:text-sm font-medium transition-all rounded-xl flex items-center justify-center gap-1.5 overflow-hidden',
            !showFavorites
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]">
            <Icon icon="tabler:layout-grid" class="w-3.5 h-3.5 flex-shrink-0" />
            <span class="truncate" :class="sidebarExpanded ? 'inline' : 'hidden md:inline'">{{ localStore.localData['submit_old_allService'] }}</span>
            <div v-if="!showFavorites" class="absolute inset-0 bg-white/10 blur-sm pointer-events-none"></div>
          </button>

        </div>

        <!-- 搜索框 -->
        <div v-if="!showFavorites" class="p-2 border-b">
          <div class="relative group">
            <Icon icon="tabler:search"
              class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 " />
            <input v-model="searchKeyword" type="text"
              :placeholder="localStore.localData['submit_old_searchServiceInput']"
              class="w-full pl-8 pr-7 py-1.5 text-[9px] md:text-sm border border-border rounded-lg bg-white dark:bg-black text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30  transition-all" />
            <button v-if="searchKeyword" @click="searchKeyword = ''"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <Icon icon="tabler:x" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- 服务列表 -->
        <div
          class="flex-1 overflow-y-auto scroll_hidden">
          <!-- 收藏服务 -->
          <template v-if="showFavorites">
            <!-- 添加收藏按钮 -->
            <div class="sticky top-0 z-10 p-2  backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
              <button @click="showFavoritePicker = true"
                class="group w-full flex items-center justify-center gap-1 p-2 rounded-xl text-[9px] md:text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50 transition-all shadow-sm">
                <Icon icon="tabler:plus" class="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-300" />
                {{ localStore.localData['submit_AddFavoriteService'] }}
              </button>
            </div>
            <div v-for="service in favoriteServices" :key="service.id" @click="handleServiceSelect(service.id)" :class="[
              'group relative flex items-center gap-1.5 px-3 py-2 cursor-pointer border-l-2 overflow-hidden transition-all duration-200',
              selectedServiceId === service.id
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            ]">
              <!-- 选中态左侧发光指示器 -->
              <div v-if="selectedServiceId === service.id"
                class="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 shadow-md shadow-blue-500/50"></div>
              <span v-show="sidebarExpanded" class="font-bold text-[9px] md:text-sm flex-shrink-0">{{ service.id }}</span>
              <span class="flex-1 flex-shrink-0 text-[9px] md:text-sm">{{ service.title }}</span>
              <span v-show="sidebarExpanded" class="whitespace-nowrap text-[9px] md:text-sm font-medium flex-shrink-0"
                :class="selectedServiceId === service.id ? 'text-blue-500' : 'text-red-400'">{{ service.price }}</span>
            </div>
            <div v-if="favoriteServices.length === 0"
              class="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Icon icon="tabler:star-off" class="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <span class="text-[9px] md:text-sm text-slate-400">{{ localStore.localData['submit_NoServicesAdded']
              }}</span>
            </div>
          </template>

          <!-- 全部服务 -->
          <template v-else>
            <!-- 搜索模式：平铺显示 -->
            <template v-if="searchKeyword.trim()">
              <div v-for="service in searchFlattenedServices" :key="service.id" @click="handleServiceSelect(service.id)"
                :class="[
                  'group relative flex items-center gap-1.5 p-2 cursor-pointer border-l-2 overflow-hidden transition-all duration-200',
                  selectedServiceId === service.id
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                ]">
                <div v-if="selectedServiceId === service.id"
                  class="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 shadow-md shadow-blue-500/50"></div>
                <span v-show="sidebarExpanded" class="font-bold text-[9px] md:text-sm flex-shrink-0">{{ service.id }}</span>
                <span class="flex-1 flex-shrink-0 text-[9px] md:text-sm">{{ service.title }}</span>
                <span v-show="sidebarExpanded" class="whitespace-nowrap text-[9px] md:text-sm font-medium flex-shrink-0"
                  :class="selectedServiceId === service.id ? 'text-blue-500' : 'text-red-400'">{{ service.price
                  }}</span>
              </div>
              <div v-if="searchFlattenedServices.length === 0"
                class="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Icon icon="tabler:search-off" class="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <span class="text-[9px] md:text-sm text-slate-400">{{ localStore.localData['submit_NoMatchingServices']
                }}</span>
              </div>
            </template>

            <!-- 非搜索模式：按组折叠显示 -->
            <template v-else>
              <template v-for="group in filteredServices" :key="group.id">
                <!-- 组标题 -->
                <div @click="toggleGroup(group.id)"
                  class="group flex items-center justify-between p-2 text-blue-500 font-semibold tracking-wide border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 select-none transition-colors">
                  <span class="text-[9px] md:text-sm uppercase">{{ group.title }}</span>
                  <div v-show="sidebarExpanded" class="flex items-center gap-1">
                    <span class="text-[9px] md:text-xs text-slate-400 dark:text-slate-500">{{ group.children.length
                      }}</span>
                    <Icon :icon="expandedGroups.has(group.id) ? 'tabler:chevron-down' : 'tabler:chevron-right'"
                      class="w-3.5 h-3.5 transition-transform duration-200 text-slate-400 dark:text-slate-500" />
                  </div>
                </div>

                <!-- 组内服务 -->
                <template v-if="expandedGroups.has(group.id)">
                  <div v-for="service in group.children" :key="service.id" @click="handleServiceSelect(service.id)"
                    :class="[
                      'group relative flex items-center gap-1.5 p-2 cursor-pointer border-l-2 overflow-hidden transition-all duration-200',
                      selectedServiceId === service.id
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    ]">
                    <div v-if="selectedServiceId === service.id"
                      class="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 shadow-md shadow-blue-500/50"></div>
                    <span v-show="sidebarExpanded" class="font-bold text-[9px] md:text-sm flex-shrink-0">{{ service.id }}</span>
                    <span class="flex-1 flex-shrink-0 text-[9px] md:text-sm">{{ service.title }}</span>
                    <span v-show="sidebarExpanded"
                      class="whitespace-nowrap text-[9px] md:text-sm font-medium flex-shrink-0"
                      :class="selectedServiceId === service.id ? 'text-blue-500' : 'text-red-400'">{{ service.price
                      }}</span>
                  </div>
                </template>
              </template>

              <div v-if="filteredServices.length === 0"
                class="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Icon icon="tabler:server-off" class="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <span class="text-[9px] md:text-sm text-slate-400">{{ localStore.localData['submit_NoMatchingServices']
                }}</span>
              </div>
            </template>
          </template>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="flex-1 min-w-0 overflow-hidden ">
        <submit v-if="ready && selectedServiceId" :id="String(selectedServiceId)" imei="" />
        <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
          <div
            class="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 mb-3">
            <div class="absolute inset-0 rounded-2xl bg-blue-400/20 blur-xl"></div>
            <Icon icon="tabler:hand-click" class="relative w-8 h-8 text-blue-400 dark:text-blue-500" />
          </div>
          <p class="text-sm">{{ localStore.localData['submit_TableToast'] }}</p>
        </div>
      </main>
    </div>

    <!-- 收藏服务选择弹窗（收藏为空时弹出，供用户添加收藏） -->
    <FavoritePickerDialog v-if="showFavoritePicker" :favorite-ids="favoriteIds" @close="showFavoritePicker = false"
      @refresh="loadFavorites" />
  </div>
</template>