import { createRouter, createWebHistory } from 'vue-router'

import desktop  from './routes/desktop'
import mobile   from './routes/mobile'
import other    from './routes/other'
import auth     from './routes/auth'
import notFound from './routes/404'

import { wxApi } from '@/api/wx'
import { ua } from '@3un/utils'
import oldSubmit from './routes/OldSubmit'

declare module 'vue-router' {
  interface RouteMeta {
    hideHeader?: boolean
    hideFooter?: boolean
    hideSidebar?: boolean
    noAuthRequired?: boolean
    force?: boolean
  }
}

const key = import.meta.env.VITE_ACCESS_TOKEN
const adminKey = import.meta.env.VITE_ADMIN_TOKEN

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...auth, notFound, ...oldSubmit,
    ua.isMobile
      ? mobile
      : desktop
    ,
    ...other,
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.force) {
    return
  }

  const uStore = useUserStore()
  const token = uStore.isAdminLogin ? sessionStorage.getItem(adminKey) : localStorage.getItem(key)

  const otherPaths = ['scan', 'service', 'orderDetail', 'qrcode-result', 'redirect']
  const isOtherPath = otherPaths.some(p => to.path.includes(p))

  // handle wx auth
  const code = to.query.code as string
  if (ua.isWechat && code) {
    const iStore = useSettingStore()
    iStore.originUrl = window.location.href
    await handleWxAuthCallback(code)
    if (isOtherPath) return true

    // return
    const { code: _code, ...restQuery } = to.query
    
    return {
      path: to.path,
      query: restQuery,
      replace: true
    }
  }

  // handle other path
  if (isOtherPath) return true

  const isAuth = to.path.includes('auth')
  const isMobilePath = to.path.startsWith('/m')

  // is mobile and not mobile path and not auth
  if (ua.isMobile && !isMobilePath && !isAuth) {
    return {
      path: to.path.length > 1 ? `/m${to.path}` : '/m',
      query: to.query,
      replace: true,
    }
  }

  if (!ua.isMobile && isMobilePath) {
    return {
      path: to.path.replace('/m', ''),
      query: to.query,
      replace: true,
    }
  }

  // handle auth
  if (!isAuth && !token && !to.meta.noAuthRequired) {
    return '/auth'
  }
  if (isAuth && token) return '/'
})

async function handleWxAuthCallback(code: string) {
  const key = import.meta.env.VITE_ACCESS_TOKEN
  const { data } = await wxApi.accessToken(code)
  localStorage.setItem(key, data)
}

export default router
