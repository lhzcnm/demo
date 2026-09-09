<script setup lang="ts">
import FormCard from './components/FormCard.vue'
import DataCard from './components/DataCard.vue'
import BulkApiCard from './components/BulkApiCard.vue'
import ApiKeyCard from './components/ApiKeyCard.vue'
// import AppCard from '../../components/AppCard.vue'
// import AppCardNew from '../../components/AppCardNew.vue'
import UnBindDialog from './components/UnBindDialog.vue'

import { wxApi } from '@/api/wx'
import { PROFILE_STORE, type ProfileStore } from './utils'
import { VALID_TYPE } from './types'

const store: ProfileStore = reactive({
  visibleUnBind: false,

  unBindType: undefined,
  validType: VALID_TYPE.PHONE,
  code: "",
  isGetCode: false,
  loading: false,
})

provide(PROFILE_STORE, store)

const ustore = useUserStore()

const chatVisible = ref(false)
const inviteVisible = ref(false)
const inviteImg = ref('')

const localStore = useLocalStore()

const mode = import.meta.env.VITE_APP_MODE

const qrcode = computed(() => {
  return `/${mode}/customer_service_qrcode.jpg`
})

async function generInviteCode() {
  const { data } = await wxApi.invite(ustore.info.openId)

  inviteImg.value = URL.createObjectURL(data)
}

onBeforeUnmount(() => {
  URL.revokeObjectURL(inviteImg.value)
})

await Promise.all([
  ustore.getInfo(true),
])
</script>

<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl">{{ localStore.localData['profile_Profile'] }}</h2>

      <div class="flex items-center space-x-2">
        <XPopover
          v-model="inviteVisible" trigger="click"
          ui-content="p-4" closeOnClickOutside
        >
          <template #trigger>
            <XButton icon="lucide:qr-code" :label="localStore.localData['profile_GenerateInviteCode']" @click="generInviteCode" />
          </template>
          <div class="w-64 border rounded overflow-hidden">
            <img v-if="inviteImg" :src="inviteImg" alt="推荐码" draggable="false" class="size-full">
          </div>
        </XPopover>
        <XPopover
          v-model="chatVisible" trigger="click"
          ui-content="p-4" closeOnClickOutside
        >
          <template #trigger>
            <XButton icon="lucide:headset" :label="localStore.localData['ticket_Customer']" />
          </template>

          <div class="w-64 border rounded overflow-hidden">
            <img :src="qrcode" alt="客服二维码" draggable="false" class="size-full">
          </div>
        </XPopover>
        <XButton
          :label="localStore.localData['sidebar_Logout']" color="danger"
          @click="ustore.logout"
        />
      </div>
    </div>

    <div class="flex items-start space-x-4">
      <FormCard />
      <section class="flex-1">
        <DataCard />
        <div class="flex flex-wrap flex-col items-start gap-2 mt-4">
          <div class="flex">
            <ApiKeyCard />
            <BulkApiCard />
          </div>
          <div class="flex">
            <!-- <AppCard :is-sidebar="false" v-if="mode === 'SanHe'" />
            <AppCardNew :is-sidebar="false" /> -->
          </div>
        </div>
      </section>
    </div>

    <UnBindDialog />
  </div>
</template>
