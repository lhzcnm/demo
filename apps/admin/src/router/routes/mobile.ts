import type { RouteRecordRaw } from 'vue-router'

import users from './mobile/users'
import service from './mobile/service'
import orders from './mobile/orders'
import recharge from './mobile/recharge'
import wechat from './mobile/wechat'
import activities from './mobile/activity'
import monitors from './mobile/monitor'
import local from './mobile/local'
import notices from './mobile/notice'

const mobile: RouteRecordRaw = {
  path: '/m',
  name: 'Mobile',
  redirect: '/m/dashboard',
  component: () => import('@mobile/index.vue'),
  children: [
    ...users,
    ...service,
    ...orders,
    ...recharge,
    ...wechat,
    ...activities,
    ...monitors,
    ...local,
    ...notices,
    {
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@mobile/pages/dashboard/index.vue'),
    },
    {
      path: 'logs',
      name: 'Logs',
      component: () => import('@mobile/pages/logs/index.vue'),
    },
    {
      path: 'credits',
      name: 'Credits',
      component: () => import('@mobile/pages/credits/index.vue'),
    },
    {
      path: 'intercept',
      name: 'Intercept',
      component: () => import('@mobile/pages/intercept/index.vue'),
    },
    {
      path: 'tickets',
      name: 'Tickets',
      component: () => import('@mobile/pages/tickets/index.vue'),
    },
    {
      path: 'upstream',
      name: 'Upstream',
      component: () => import('@mobile/pages/upstream/index.vue'),
    },
    {
      path: 'settings',
      name: 'Settings',
      component: () => import('@mobile/pages/settings/index.vue'),
    },
    {
      path: 'voucher',
      name: 'Voucher',
      component: () => import('@mobile/pages/voucher/index.vue'),
    },
  ],
}

export default mobile
