<script setup lang="ts">
import { orderApi, type OrderProgressResp } from '@/api/orders'
import { SUBMIT_STORE } from '../utils'

interface CompareDataItem {
  success: number
  failed: number
}

interface OrderProgressEmits {
  changed: []
}

const store = inject(SUBMIT_STORE)!
const emits = defineEmits<OrderProgressEmits>()

const serviceStore = useServiceStore()
const localStore = useLocalStore()

const hasChange = ref<boolean>(true)
const collapsed = ref(false)
let timer: number | undefined

/** 上一次的进度数据，用于对比变化 */
let lastProgress: CompareDataItem = {
  success: 0,
  failed: 0
}

/** 当前选中的服务 */
const service = computed(() => {
  return serviceStore.services.get(store.selectId)
})

/** 是否显示进度组件 */
const visible = computed(() => store.visibleGress && hasChange.value)

/**
 * 监听服务 ID 变化
 * 切换服务时重置进度状态
 */
watch(
  () => store.selectId,
  async () => {
    stopTimer()
    store.visibleGress = false
    lastProgress = { success: 0, failed: 0 }
    await getProgressStatus()
  },
  {
    immediate: true
  }
)

/**
 * 监听刷新进度信号
 * 外部触发刷新时重新获取进度
 */
watch(
  () => store.refreshProgress,
  async () => {
    stopTimer()
    await getProgressStatus()
  },
  { immediate: true }
)

/**
 * 获取进度状态
 */
async function getProgressStatus() {
  if (!service.value) return

  try {
    const { data } = await orderApi.orderProgress({
      serviceId: store.selectId
    })

    if (data.total === 0 || (data.processing === 0 && data.waiting === 0)) {
      stopTimer()
    } else {
      startTimer()
      store.visibleGress = true
    }

    compareData(data)
  } catch {
    stopTimer()
  }
}

/**
 * 启动定时轮询
 */
function startTimer() {
  stopTimer()
  timer = window.setInterval(() => {
    getProgressStatus()
  }, 9000)
}

/**
 * 停止定时轮询
 */
function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

/**
 * 对比数据变化
 * 当成功或失败数量变化时触发 changed 事件
 */
function compareData(data: OrderProgressResp) {
  const lastSuccess = lastProgress.success
  const lastFailed = lastProgress.failed

  const successChanged = data.success - lastSuccess
  const failedChanged = data.failed - lastFailed

  if (
    (successChanged !== 0 || failedChanged !== 0)
    && store.rawOrders.length > 0
  ) {
    hasChange.value = true
    emits('changed')
  }

  lastProgress = {
    success: data.success,
    failed: data.failed,
  }
}

/**
 * 订单状态数据列表
 * 用于渲染进度统计卡片
 */
const orderStatusData = computed(() => {
  const localData = localStore.localData || {}

  return [
    {
      label: localData["submit_ordergress_success"] || '成功',
      value: store.progressData.success || 0,
      class: 'text-success bg-green-400/10'
    },
    {
      label: localData["submit_ordergress_failed"] || ('失败' + "/" + "拒绝"),
      value: store.progressData.failed + '/' + store.progressData.reject || 0,
      class: 'text-danger bg-red-400/10'
    },
    {
      label: localData["submit_ordergress_processing"] || '处理中',
      value: store.progressData.processing || 0,
      class: 'text-primary bg-blue-400/10'
    },
    {
      label: localData["submit_ordergress_waiting"] || '待处理',
      value: store.progressData.waiting || 0,
      class: 'text-warning bg-yellow-400/10'
    }
  ]
})

/**
 * 组件卸载时清理定时器
 */
onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div v-if="visible" class="w-full mt-2 rounded-xl border text-[9px] md:text-[14px]">
    <div v-if="!collapsed" class="p-1 md:p-2 space-y-1 select-none">
      <!-- 统计卡片 -->
      <div class="overflow-x-auto md:overflow-x-visible overflow-y-hidden pb-1 md:pb-2">
        <section class="grid grid-cols-5 gap-1 md:gap-2 min-w-max md:min-w-0 select-none">
          <!-- 总数 -->
          <div class="flex justify-between bg-sky-500/10 p-1 md:p-2 border-b text-sky-500 rounded-md w-[60px] md:w-auto md:flex-1">
            <span>{{ localStore.localData["submit_ordergress_total"] }}</span>
            <b>{{ store.progressData.total }}</b>
          </div>

          <!-- 各状态统计 -->
          <div v-for="item in orderStatusData" :key="item.label"
            class="flex justify-between items-center rounded-md p-1 md:p-2 w-[80px] md:w-auto md:flex-1"
            :class="item.class">
            <span>{{ item.label }}</span>
            <b>{{ item.value }}</b>
          </div>
        </section>
      </div>

      <!-- 进度条 -->
      <div class="h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div class="h-full bg-primary" :style="{
          width: `${((store.progressData.success + store.progressData.failed + store.progressData.reject) / store.progressData.total * 100) || 0}%`
        }" />
      </div>
    </div>
  </div>
</template>