<script setup lang="ts">
import type { XCaptchaCheckParams } from '@/components'

const baseUrl = 'https://api.3unlocked.com/api'
const visible = ref(false)

async function getCaptcha() {
  const response = await fetch(`${baseUrl}/auth/captcha-refresh`)
  return await response.json()
}

async function checkCaptcha(params: XCaptchaCheckParams) {
  const response = await fetch(`${baseUrl}/auth/captcha-check`, {
    body: JSON.stringify(params),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return await response.json()
}
</script>

<template>
  <Demo>
    <div>
      <XButton @click="visible = true">
        显示验证码
      </XButton>
    </div>

    <XCaptchaSlider
      v-model="visible"
      :refresh="getCaptcha"
      :verify="checkCaptcha"
    />
  </Demo>
</template>
