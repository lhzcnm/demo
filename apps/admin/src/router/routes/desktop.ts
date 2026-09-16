import type { RouteRecordRaw } from 'vue-router'

import users from './desktop/users'
import service from './desktop/service'
import wechat from './desktop/wechat'
import orders from './desktop/orders'
import tools from './desktop/tools'
import recharge from './desktop/recharge'
import activities from './desktop/activity'
import notices from './desktop/notice'
import monitors from './desktop/monitor'
import print from './desktop/print'
import local from './desktop/local'

const mode = import.meta.env.VITE_APP_MODE

const desktop: RouteRecordRaw = {
  path: '/',
  name: 'Desktop',
  redirect: '/dashboard',
  component: () => import('@desktop/index.vue'),
  children: [
    ...users,
    ...service,
    ...wechat,
    ...orders,
    ...tools,
    ...recharge,
    ...activities,
    ...notices,
    ...monitors,
    ...print,
    ...local,
    {
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@desktop/pages/dashboard/index.vue'),
    },
    
    {
      path: 'tickets',
      name: 'Tickets',
      component: () => import('@desktop/pages/tickets/index.vue'),
    },
    {
      path: 'upstream',
      name: 'Upstream',
      component: () => import('@desktop/pages/upstream/index.vue'),
    },
    {
      path: 'intercept',
      name: 'Intercept',
      component: () => import('@desktop/pages/intercept/index.vue'),
    },
    {
      path: 'logs',
      name: 'Logs',
      component: () => import('@desktop/pages/logs/index.vue'),
    },
    {
      path: 'credits',
      name: 'Credits',
      component: () => import('@desktop/pages/credits/index.vue'),
    },
    {
      path: 'voucher',
      name: 'Voucher',
      component: () => import('@desktop/pages/voucher/index.vue'),
    },
    (mode === 'LuShen' || mode === 'SanHe') && {
      path: 'oss',
      name: 'Oss',
      component: () => import('@desktop/pages/oss/index.vue'),
    },
    mode === 'LuShen' && {
      path: 'docx',
      name: 'Docx',
      component: () => import('@desktop/pages/docx/index.vue'),
    },
  ].filter(item => !!item),
}

export default desktop
