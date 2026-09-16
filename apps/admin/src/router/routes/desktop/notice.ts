import type { RouteRecordRaw } from 'vue-router'

const notices: RouteRecordRaw[] = [
  {
    path: 'notice',
    name: 'Notice',
    component: () => import('@desktop/pages/notice/index.vue'),
  },
]

export default notices
