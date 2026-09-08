import type { RouteRecordRaw } from 'vue-router'

const oldSubmit: RouteRecordRaw[] = [
  {
    path: '/oldSubmit/:id?/:imei?',
    component: () => import('@other/OldSubmit.vue'),
  }
  ,
  {
    path: '/m/oldSubmit/:id?/:imei?',
    component: () => import('@other/OldSubmit.vue'),
  }
]

export default oldSubmit
