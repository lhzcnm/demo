<script setup lang="ts">
import UpstreamForm from './UpstreamForm.vue'

import { API_TYPE } from '@3un/utils'

import { createUpstream, updateUpstream } from '@/api/upstream'
import { VERIFY_MSG, validate, type ValidRule } from '@/utils'
import { UPSTREAM_STORE } from '../utils'

const store = inject(UPSTREAM_STORE)!

function validForm() {
  const { apiType, apiTitle, serverUrl, accountId, apiKey } = store.formBase
  if (apiType === API_TYPE.CUSTOM) return true

  let rules: ValidRule[] = [
    { rule: !!apiTitle.trim(), message: VERIFY_MSG.REQ_API_TITLE },
  ]

  const isDhru = apiType === API_TYPE.DHRU
  const isRealtime = apiType === API_TYPE.REALTIME

  if (isDhru) {
    rules.push(
      { rule: !!accountId, message: VERIFY_MSG.REQ_ACCOUNT_ID },
      { rule: !!apiKey, message: VERIFY_MSG.REQ_API_KEY },
    )
  }

  if (isRealtime || isDhru) {
    rules.push({ rule: !!serverUrl.trim(), message: VERIFY_MSG.REQ_SERVER_URL })
  }

  return validate(rules)
}

async function handleCreate() {
  const data = await createUpstream(store.formBase)
  // store.upstreams.push(data)
  store.visibleBase = false
  store.refresh = !store.refresh
}

async function handleUpdate() {
  const upstream = store.upstreams[store.index!]
  const body = { ...store.formBase, apiId: upstream.apiId }
  await updateUpstream(body)

  // store.upstreams[store.index!] = { ...upstream, ...body }
  store.visibleBase = false
  store.refresh = !store.refresh
}
</script>

<template>
  <FormDialog
    v-model="store.visibleBase"
    :index="store.index"
    :validate="validForm"
    :update="handleUpdate"
    :create="handleCreate"
  >
    <UpstreamForm v-model="store.formBase" />
  </FormDialog>
</template>
