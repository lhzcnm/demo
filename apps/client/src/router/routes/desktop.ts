import type { RouteRecordRaw } from 'vue-router'

const home: RouteRecordRaw = {
  path: '/',
  name: 'Home',
  component: () => import('@desktop/index.vue'),
  children: [
    {
      path: '',
      name: 'Services',
      component: () => import('@desktop/pages/home/index.vue'),
    },
    {
      name: 'Submit',
      path: 'submit/:id(\\d{4})?/:imei?',
      component: () => import('@desktop/pages/submit/index.vue'),
      props: true,
    },
    {
      name: 'Custom-Submit',
      path: 'custom-submit',
      component: () => import('@desktop/pages/custom-submit/index.vue'),
      props: true,
    },
    {
      path: 'history',
      name: 'History',
      props: true,
      component: () => import('@desktop/pages/history/index.vue'),
    },
    {
      name: 'Recharge',
      path: 'recharge/:tab?',
      component: () => import('@desktop/pages/recharge/index.vue'),
      props: true,
    },
    {
      path: 'ticket',
      name: 'Ticket',
      component: () => import('@desktop/pages/ticket/index.vue'),
    },
    {
      path: 'credits',
      name: 'Credits',
      component: () => import('@desktop/pages/credits/index.vue'),
    },
    {
      path: 'profile',
      name: 'Profile',
      component: () => import('@desktop/pages/profile/index.vue'),
    },
    {
      path: 'todo',
      name: 'Todo',
      component: () => import('@desktop/pages/todo/index.vue'),
    },
    // {
    //   path: '/quotation',
    //   name: 'quotation',
    //   meta: {
    //     hideHeader: true,
    //     hideSidebar: true,
    //   },
    //   component: () => import('@desktop/pages/quotation/index.vue'),
    // },
  ]
}

if (import.meta.env.VITE_APP_DEVICE === 'true') {
  home.children && home.children.push({
    path: 'device', name: 'Device',
    component: () => import('@desktop/pages/device/index.vue'),
  })
}

export default home
