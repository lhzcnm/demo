<script setup lang="ts">
import type { XBulletinBoardProps } from './helper'

import { Icon } from '@iconify/vue'
import { style } from './_style'

defineOptions({ name: 'XBulletinBoard' })
defineProps<XBulletinBoardProps>()

const b = style()
</script>

<template>
  <section
    :class="b.base()"
    :style="{ '--bg': 'hsl(var(--background))' }"
  >
    <div :class="b.icon()">
      <Icon
        :class="b.iconInner()"
        icon="hugeicons:megaphone-02"
      />
    </div>

    <div :class="b.text()" v-html="text" />
  </section>
</template>
