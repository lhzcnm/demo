import type { RouteRecordRaw } from 'vue-router'

const notices: RouteRecordRaw[] = [
  {
    path: 'notice',
    name: 'mobileNotice',
    component: () => import('@mobile/pages/notice/index.vue'),
  },
]

export default notices
