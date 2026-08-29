<script setup lang="ts">
import { ORDER_STATUS, ORDER_STATUS_MAP, SUBMIT_METHOD_MAP } from '@3un/utils'
import { Icon } from '@iconify/vue'
import { toast } from 'vue-sonner'

import { zOrderUpdateForm, type Order } from '@/inters/orders'
import { pushOrder, updateCodeStatus, reSubmitOrder } from '@/api/orders'

import { ORDER_STORE } from '../utils'

interface TheProps {
  order: Order
  index: number
}

const props = defineProps<TheProps>()
const { order } = props

const serviceStore = useServiceStore()
const store = inject(ORDER_STORE)!

const serviceName = computed(() => {
  const service = serviceStore.itemMap.get(order.packageId)
  return service ? service.packageTitle : '--'
})

const speed = getSpeed()
const isOpen = ref(false)

function getSpeed() {
  const whiteList = [ORDER_STATUS.PROCESSING, ORDER_STATUS.WAIT]
  if (whiteList.includes(order.codeStatusId)) {
    return null
  }

  const updateTimeDate = new Date(order.updateTime).getTime()
  const requestedAtDate = new Date(order.requestUpTime).getTime()
  const diffTime = updateTimeDate - requestedAtDate
  const diff = Math.round(diffTime / 1000)
  return diff < 1 ? '<1s' : `${diff}s`
}

function handleClick() {
  store.formUpdate = zOrderUpdateForm.parse({
    codeId: order.codeId,
    imeiNo: order.imeiNo,
    code: order.code.split('<br>').join('\n'),
    codeStatusId: order.codeStatusId,
    originalStatus: order.codeStatusId,
    messageFromServer: order.messageFromServer,
    orderIdFromServer: order.orderIdFromServer,
  })

  store.index = props.index
  store.visibleUpdate = true
}

function handlePushOrder() {
  pushOrder([order.codeId]).then(() => {
    store.orders.list[props.index] = {
      ...order, downloaded: true,
    }

    toast.success('推送成功')
  })
}

function handleAcceptOrder() {
  const params = {
    userId: order.userId,
    codeId: order.codeId,
    codeStatusId: ORDER_STATUS.PROCESSING,
    originalStatus: order.codeStatusId,
  }

  updateCodeStatus([params]).then(() => {
    store.orders.list[props.index] = {
      ...order, codeStatusId: ORDER_STATUS.PROCESSING,
    }

    toast.success('接受成功')
  })
}

function handleReSubmitOrder() {
  reSubmitOrder([order.codeId]).then(() => {
    store.refresh = !store.refresh
    toast.success('重新提交成功')
  })
}

function handleRejectOrder() {
  const params = {
    userId: order.userId,
    codeId: order.codeId,
    codeStatusId: ORDER_STATUS.FAILED,
    originalStatus: order.codeStatusId,
  }

  updateCodeStatus([params]).then(() => {
    store.orders.list[props.index] = {
      ...order, codeStatusId: ORDER_STATUS.FAILED,
    }

    toast.success('拒绝成功')
  })
}
</script>

<template>
  <div class="p-3 bg-card border rounded-lg" @click="handleClick">
    <div class="flex items-center justify-between">
      <span class="text-base font-medium">{{ order.codeId }}</span>

      <XPopover
        v-model="isOpen"
        close-on-click-outside
        placement="bottom-end"
        trigger="click"
      >
        <template #trigger>
          <button class="text-muted-foreground" @click.stop>
            <Icon icon="lucide:ellipsis-vertical" class="size-4" />
          </button>
        </template>

        <div class="flex flex-col text-sm divide-y">
          <button
            class="flex items-center justify-center p-2 text-primary"
            @click="handlePushOrder"
          >
            <Icon icon="lucide:bell" class="size-4 mr-1" />
            <span>推送通知</span>
          </button>
          <button
            class="flex items-center justify-center p-2 text-warning"
            @click="handleReSubmitOrder"
          >
            <Icon icon="lucide:rotate-ccw" class="size-4 mr-1" />
            <span>重新提交</span>
          </button>
          <button
            class="flex items-center justify-center p-2 text-success"
            @click="handleAcceptOrder"
          >
            <Icon icon="lucide:check-circle" class="size-4 mr-1" />
            <span>接受订单</span>
          </button>
          <button
            class="flex items-center justify-center p-2 text-danger"
            @click="handleRejectOrder"
          >
            <Icon icon="lucide:x-circle" class="size-4 mr-1" />
            <span>拒绝订单</span>
          </button>
        </div>
      </XPopover>
    </div>

    <div class="flex space-x-1 mt-2">
      <XTag color="primary" :label="order.packageId.toString()" size="sm" />
      <XTag v-bind="SUBMIT_METHOD_MAP[order.submitMethod]" size="sm" />
      <XTag v-bind="ORDER_STATUS_MAP[order.codeStatusId]" size="sm" />
      <XTag v-if="speed" color="primary" :label="speed" size="sm" />
    </div>

    <div class="mt-2 text-sm">
      <div class="flex items-center">
        <span class="text-muted-foreground shrink-0">上游订单号：</span>
        <span class="font-medium break-all">{{ order.orderIdFromServer }}</span>
      </div>
      <div class="flex items-start">
        <span class="text-muted-foreground shrink-0">处理服务：</span>
        <span class="font-medium break-all">{{ serviceName }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-muted-foreground shrink-0">数据来源：</span>
        <span class="font-medium break-all">{{ order.imeiNo }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-muted-foreground shrink-0">订单创建时间：</span>
        <span class="font-medium break-all">{{ order.requestedAt.slice(5) }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-muted-foreground shrink-0">上游请求时间：</span>
        <span class="font-medium break-all">{{ order.requestUpTime.slice(5) }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-muted-foreground shrink-0">上游更新时间：</span>
        <span class="font-medium break-all">{{ order.updateTime.slice(5) }}</span>
      </div>
      <!-- <div class="flex items-center">
        <span class="text-muted-foreground shrink-0">更新日期：</span>
        <span class="font-medium break-all">{{ order.updateTime.slice(5) }}</span>
      </div> -->
      <div class="flex items-center">
        <span class="text-muted-foreground shrink-0">所属用户：</span>
        <a
          :href="`/users?uid=${order.userId}`"
          class="font-medium break-all underline"
        >
          {{ order.userId }}
        </a>
      </div>
      <div class="flex items-center">
        <span class="text-muted-foreground shrink-0">推送状态：</span>
        <span class="font-medium break-all">
          {{ order.downloaded ? '已推送' : '未推送' }}
        </span>
      </div>
      <div class="flex items-center">
        <span class="text-muted-foreground shrink-0">订单积分：</span>
        <span class="font-medium break-all">{{ order.credits }}</span>
      </div>
    </div>

    <div class="mt-2 text-sm">
      <div class="text-muted-foreground mb-1">订单结果</div>
      <div
        class="bg-muted rounded p-3 whitespace-pre-line overflow-x-auto"
        v-html="order.code.trim() || '订单处理中...'"
      />
    </div>

    <div class="mt-2 text-sm" v-if="order.comments">
      <div class="text-muted-foreground mb-1">订单备注</div>
      <div class="bg-muted rounded p-3">
        {{ order.comments }}
      </div>
    </div>
  </div>
</template>
