// import { ua } from "@3un/utils"

import { ua } from "@3un/utils"

export interface SidebarMenu {
  label: string
  icon: string
  path: string
  badge?: (() => number)
  match?: string[] | string
  children?: SidebarMenuChild[]
}
export interface SidebarMenuChild {
  match?: string[] | string
  label: string
  path: string
  icon?: string
  badge?: (() => number)
}

const mode = import.meta.env.VITE_APP_MODE

export const menus: SidebarMenu[] = [
  {
    label: '仪表盘',
    path: '/dashboard',
    icon: 'lucide:home',
    match: 'yibiaopan',
  },
  {
    label: '前台中英',
    path: '/local',
    icon: 'lucide:home',
    children: [
      { label: '全部中英', match: 'local', path: '/local' },
      { label: '工具栏', match: 'local', path: '/local?q=1' },
      { label: '侧边栏', match: 'local', path: '/local?q=2' },
      { label: '登录页面', match: 'local', path: '/local?q=3' },
      { label: '首页', match: 'local', path: '/local?q=4' },
      { label: '订单提交', match: 'local', path: '/local?q=5' },
      { label: '查询打印', match: 'local', path: '/local?q=6' },
      { label: '我的设备', match: 'local', path: '/local?q=7' },
      { label: '我的订单', match: 'local', path: '/local?q=8' },
      { label: '积分充值', match: 'local', path: '/local?q=9' },
      { label: '消费记录', match: 'local', path: '/local?q=10' },
      { label: '我的工单', match: 'local', path: '/local?q=11' },
      { label: '会员中心', match: 'local', path: '/local?q=12' },
    ],
  },
  {
    label: '用户管理',
    path: '/users',
    icon: 'lucide:users',
    children: [
      { label: '会员', match: 'huiyuan', path: '/users' },
      { label: '管理员', match: 'guanliyuan', icon: 'lucide:smile', path: '/users?q=admin' },
      { label: '包月会员', match: 'baoyuehuiyuan', icon: 'lucide:crown', path: '/users/paid' },
      { label: '会员等级', match: 'huiyuandengji', icon: 'lucide:gem', path: '/users/level' },
    ],
  },
  {
    label: '服务管理',
    path: '/service',
    icon: 'lucide:package-2',
    children: [
      { label: '字段分割', match: 'zifuangengfen', icon: 'lucide:square-split-horizontal', path: '/service/fields' },
      { label: '解锁推荐', match: 'jiesuojianyi', icon: 'lucide:flame', path: '/service/unlock' },
      { label: '服务组', match: 'fuwuzu', icon: 'lucide:users', path: '/service/groups' },
      { label: '服务', match: 'fuwu', icon: 'lucide:package', path: '/service/items' },
      // ua.isDesktop && { label: '打印模板', match: 'fuwu', icon: 'lucide:package', path: '/service/template' },
    ].filter(item => !!item),
  },
  ua.isDesktop &&{
    label: '打印模板',
    path: '/print',
    icon: 'lucide:layout-template',
    children: [
      { label: '服务模板', match: 'fuwumuban', icon: '', path: '/print/service' },
      { label: '设备模板', match: 'shebeimuban', icon: '', path: '/print/device' },
    ],
  },
  {
    label: '订单管理',
    path: '/orders',
    icon: 'lucide:shopping-bag',
    children: [
      { label: '全部订单', match: 'quandingdan', path: '/orders' },
      // {
      //   label: '商城订单',
      //   match: '商城订单',
      //   path: '/orders/mall',
      //   icon: 'lucide:handbag',
      // },
      {
        label: '订单验证',
        match: 'dingdanyanzheng',
        path: '/orders/verify',
        icon: 'lucide:check-circle',
        badge: () => {
          const iStore = useSystemStore()
          return iStore.todoCount.verifying
        }
      },
      {
        label: '等待处理',
        match: 'dengdaichuli',
        path: '/orders?q=wait',
        icon: 'lucide:clock',
        badge: () => {
          const iStore = useSystemStore()
          return iStore.todoCount.awaiting
        }
      },
      {
        label: '正在处理',
        match: 'zhengzaichuli',
        path: '/orders?q=processing',
        icon: 'lucide:square-activity',
        badge: () => {
          const iStore = useSystemStore()
          return iStore.todoCount.processing
        },
      },
    ],
  },
  // {
  //   label: '报价单管理',
  //   path: '/quotations',
  //   icon: 'lucide:clipboard-list',
  //   children: [
  //     { label: '基础数据', match: 'basePrice', path: '/quotations' },
  //     { label: '设备备注', match: 'deviceRemark', path: '/quotations/remarks' },
  //   ]
  // },
  {
    label: '充值管理',
    path: '/recharge',
    icon: 'lucide:credit-card',
    children: [
      { label: '会员充值', match: 'huiyuanchongzhi', path: '/recharge' },
      { label: '今日充值', match: 'jinritianchongzhi', icon: 'lucide:calendar-days', path: '/recharge?q=today' },
      { label: '管理员充值', match: 'guanliyuanchongzhi', icon: 'lucide:coins', path: '/recharge?q=admin' },
      { label: '包月套餐', match: 'baoyuetaocan', icon: 'lucide:pizza', path: '/recharge/packages' },
    ],
  },
  {
    label: '日志管理',
    path: '/logs',
    icon: 'lucide:hard-drive',
    children: [
      { label: '用户登录日志', match: 'yonghudengluri', path: '/logs' },
      { label: '管理员登录日志', match: 'guanliyuandengluri', icon: 'lucide:paw-print', path: '/logs?q=admin' },
    ],
  },
  {
    label: '微信管理',
    path: '/wechat',
    icon: 'ph:wechat-logo',
    children: [
      { label: '菜单栏', match: 'caidanlan', path: '/wechat/menu' },
      { label: '客服消息', match: 'kefuxiaoxi', icon: 'lucide:message-circle-more', path: '/wechat/message' },
    ],
  },
  {
    label: '活动管理',
    path: '/activity',
    icon: 'solar:balloon-outline',
    children: [
      { label: '活动列表', match: 'caidanlan', path: '/activity' },
      { label: '活动充值', match: 'huodongchongzhi', path: '/activity/recharge' },
    ],
  },
  {
    label: '公告管理',
    path: '/notice',
    icon: 'lucide:megaphone',
    match: 'Notice',
  },
  mode === "LuShen" && {
    label: "说明文档管理",
    path: "/docx",
    icon: "lucide:receipt-text",
    match: "ClientDocx"
  },
  mode === "SanHe" && {
    label: "监控服务器",
    path: "/on-monitor/servers",
    icon: "lucide:server",
    match: "monitorServers",
    // children: [
    //   // { label: "监控平台用户", match: "monitorUsers", path: "/on-monitor/users" },
    //   { label: "监控服务器", match: "monitorServers", path: "/on-monitor/servers" },
    // ]
  },
  {
    label: '积分券管理',
    path: '/voucher',
    icon: 'lucide:ticket',
    match: 'jifenquan',
  },
  {
    label: '积分记录',
    path: '/credits',
    icon: 'lucide:coins',
    match: 'jifenjilu',
  },
  ua.isDesktop && (mode === 'SanHe' || mode === 'LuShen') && {
    label: 'oss管理',
    path: '/oss',
    icon: 'lucide:cloud',
    match: 'oss'
  },
  {
    label: '工单管理',
    path: '/tickets',
    icon: 'lucide:messages-square',
    match: 'gongdanguanli',
    badge: () => {
      const iStore = useSystemStore()
      return iStore.todoCount.ticket
    },
  },
  {
    label: 'API 管理',
    path: '/upstream',
    icon: 'lucide:plug-zap',
    match: 'apiguanli',
  },
  {
    label: '拦截管理',
    path: '/intercept',
    icon: 'lucide:pocket',
    match: 'lanjieguanli',
  },
].filter(item => !!item)

export const tools: SidebarMenu[] = [
  {
    label: '批量编辑订单',
    path: '/batch-edit-orders',
    icon: 'lucide:square-bottom-dashed-scissors',
    match: 'piliangbianjidingdan',
  },
  {
    label: '富文本编辑',
    path: '/editor',
    icon: 'lucide:remove-formatting',
    match: 'fuwenbenbianji',
  },
]

export const others: SidebarMenu[] = [
  { label: '设置', icon: 'lucide:settings', path: 'settings' },
  { label: '退出登录', icon: 'lucide:log-out', path: 'logout' },
]
