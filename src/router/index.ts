import useBdVid from '@/composables/useBdVid'
import useClickId from '@/composables/useClickId'
import usePageTitle from '@/composables/usePageTitle'
import useRoleCheck from '@/composables/useRoleCheck'
import useSidebar from '@/composables/useSidebar'
import Sensors from '@/utils/sensors'
import { locationComToCn } from '@/utils/url'
import Redirect from '@/views/naviagte/Redirect.vue'
import { nextTick } from 'vue'
import { RouterView, createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

export const RoutesMap = {
  aiPlugin: {
    center: 'aipluginCenter',
    detail: 'aipluginDetail'
  },
  home: {
    homeName: 'home',
    index: 'homeIndex',
    nash: 'homeNash',
    case: 'homeCase',
    homeResource: 'homeResource',
    homeChat: 'homeChat'
  },
  auth: {
    authName: 'auth',
    login: 'authLogin',
    loginInvite: 'authLoginInvite',
    logout: 'authLogout',
    verify: 'authVerify'
  },
  safe: 'safe',
  release: 'release',
  chat: {
    chatName: 'chat',
    release: 'chatRelease',
    c: 'chatC',
    homeC: 'chatHomeC',
    resource: 'resource',
    navigator: 'navigator',
    share: 'share'
  },
  resource: 'resource',
  tranning: {
    bot: 'tranningBot',
    roleInfo: 'tranningRoleInfo',
    knowledge: 'tranningKnowledge',
    knowledgeGenerate: 'tranningKnowledgeGenerate',
    release: 'tranningRelease',
    report: 'tranningReport',
    reportContext: 'tranningReportContext',
    botChat: 'tranningBotChat'
  },
  manager: {
    managerName: 'manager',
    center: 'managerCenter',
    create: 'managerCreate',
    createByDoc: 'managerCreateByDoc'
  },
  namespace: {
    namespaceName: 'namespace',
    personalSetting: 'namespacePersonalSetting',
    management: 'namespacePersonalManagement',
    summary: 'namespaceSummary',
    income: 'namespaceIncome'
  },
  vip: {
    center: 'vipCenter'
  },
  inviteMember: 'inviteMember',
  guide: {
    first: 'guideFirst'
  },
  namespaceSwitch: 'namespaceSwitch',
  endPlatform: {
    adCollectForm: 'endPlatformadCollectForm'
  }
}

const coreRoutes = [
  {
    path: '/error',
    component: RouterView,
    children: [
      {
        path: '403',
        component: () => import('@/views/error/Error403.vue')
        // meta: { title: '错误 403' }
      },
      {
        path: '404',
        component: () => import('@/views/error/Error404.vue')
        // meta: { title: '错误 404' }
      },
      {
        path: '500',
        component: () => import('@/views/error/Error500.vue')
        // meta: { title: '错误 500' }
      },
      {
        name: RoutesMap.auth.loginInvite,
        path: '/auth/loginInvite',
        component: () => import('@/views/auth/LoginInvitationView.vue')
      }
    ]
  },
  {
    path: '/rx',
    component: Redirect
  }
]

const loginedRoutes = [
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        name: RoutesMap.release,
        path: '/b',
        component: RouterView,
        children: [
          {
            name: RoutesMap.chat.release,
            path: ':botSlug',
            component: () => import('@/views/chat/shareChat.vue'),
            meta: {
              // title: '对话'
            }
          }
        ]
      },
      {
        name: RoutesMap.chat.share,
        path: '/c/bot/share/:shareId',
        component: () => import('@/views/share/index.vue')
      },
      {
        path: '/',
        component: () => import('@/views/chat/index.vue'),
        meta: {
          title: '对话',
          requiresAuth: true
        },
        children: [
          {
            name: RoutesMap.chat.c,
            path: '/c/bot/-1',
            // meta: { title: '聊天' },
            component: () => import('@/views/chating/ChatItem.vue'),
            props: (route) => ({ aiType: route.query.aiType })
          },
          {
            name: RoutesMap.chat.c,
            path: '/c/bot/:botSlug',
            // meta: { title: '聊天' },
            component: () => import('@/views/chating/ChatItem.vue'),
            props: (route) => ({ p: route.query.p })
          }
        ]
      },
      ...coreRoutes
    ]
  }
]

const finalRoutes = [
  {
    path: '/:any+',
    redirect: '/error/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...loginedRoutes, ...finalRoutes] as RouteRecordRaw[]
})

router.beforeEach((to) => {
  if (to.path === '/')
    return {
      path: '/c/bot/-1',
      query: to.query
    }
  const { drawerVisible } = useSidebar()
  drawerVisible.value = false
  locationComToCn()
  useRoleCheck(to)
  usePageTitle(to.meta?.title)
  useClickId(to)
  useBdVid(to)
})

router.afterEach(() => {
  nextTick(() => {
    const sensors = new Sensors()
    const { saInstance } = sensors
    saInstance?.quick('autoTrackSinglePage')
  })
})

// 由于当前部署，采用镜像构建并覆盖全部新文件，解决网站有老用户停留在老页面，但旧资源地址在服务器已被移除掉的问题
// 期待 Vite 的解决方案：https://github.com/vitejs/vite/issues/11804
router.onError((error, to) => {
  if (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed')
  ) {
    if (!to?.fullPath) {
      window.location.reload()
    } else {
      window.location.href = to.fullPath
    }
  }
})

export default router
