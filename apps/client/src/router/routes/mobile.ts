import type { RouteRecordRaw } from 'vue-router'

const mobile: RouteRecordRaw = {
  path: '/m',
  name: 'Mobile',
  component: () => import('@mobile/index.vue'),
  children: [
    {
      path: '',
      name: 'Home',
      component: () => import('@mobile/pages/home/index.vue'),
    },
    {
      name: 'Submit',
      path: 'submit/:id(\\d{4})?/:imei?',
      component: () => import('@mobile/pages/submit/index.vue'),
      props: true,
    },
    {
      path: 'history',
      name: 'History',
      props: true,
      component: () => import('@mobile/pages/history/index.vue'),
    },
    {
      name: 'Recharge',
      path: 'recharge/:tab?',
      component: () => import('@mobile/pages/recharge/index.vue'),
      meta: { hideHeader: true, hideFooter: true },
      props: true,
    },
    {
      path: 'credits',
      name: 'Credits',
      component: () => import('@mobile/pages/credits/index.vue'),
      meta: { hideHeader: true, hideFooter: true },
    },
    {
      path: 'bill',
      name: 'Bill',
      component: () => import('@mobile/pages/bill/index.vue'),
      meta: { hideHeader: true, hideFooter: true },
    },
    {
      path: 'ticket',
      name: 'Ticket',
      component: () => import('@mobile/pages/ticket/index.vue'),
    },
    {
      path: 'todo',
      name: 'Todo',
      meta: { hideHeader: true },
      component: () => import('@mobile/pages/todo/index.vue'),
    },
    {
      path: 'profile',
      name: 'Profile',
      meta: { hideHeader: true },
      component: () => import('@mobile/pages/profile/index.vue'),
    },
    {
      path: 'tools',
      name: 'Tools',
      meta: { hideHeader: true, hideFooter: true },
      component: () => import('@mobile/pages/tools/index.vue'),
    },
    // {
    //   path: 'quotation',
    //   name: 'Quotation',
    //   meta: { hideHeader: true, hideFooter: true },
    //   component: () => import('@mobile/pages/quotation/index.vue'),
    // },
  ],
}

export default mobile
