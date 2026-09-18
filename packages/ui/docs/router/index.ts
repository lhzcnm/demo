import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '~/utils/routes'

const route = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/button',
      children: routes,
    },
  ],
})

export default route
