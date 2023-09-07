import usePageTitle from '@/composables/usePageTitle'
import useRoleCheck from '@/composables/useRoleCheck'
import useSidebar from '@/composables/useSidebar'
import { useAuthStore } from '@/stores/auth'
import Sensors from '@/utils/sensors'
import { locationComToCn } from '@/utils/url'
import { nextTick } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'

export const RoutesMap = {
  home: {
    homeName: 'home',
    index: 'homeIndex',
    nash: 'homeNash',
    case: 'homeCase'
  },
  auth: {
    authName: 'auth',
    login: 'authLogin',
    logout: 'authLogout',
    verify: 'authVerify'
  },
  safe: 'safe',
  release: 'release',
  chat: {
    chatName: 'chat',
    release: 'chatRelease',
    c: 'chatC'
  },
  resource: 'resource',
  tranning: {
    information: 'information',
    release: 'release',
    kownlwedge: 'kownlwedge',
    bot: 'tranningBot',
    botUser: 'tranningBotUser',
    botPersona: 'tranningBotPersona',
    botContentQA: 'tranningBotContentQA',
    botContentDoc: 'tranningBotContentDoc',
    botRelease: 'tranningBotRelease',
    botReleaseChannel: 'tranningBotReleaseChannel',
    botReleaseSetting: 'tranningBotReleaseSetting',
    botChat: 'tranningBotChat',
    report: 'tranningReport',
    reportDetail: 'tranningReportDetail',
    reportContext: 'tranningReportContext',
    reportCollectForm: 'tranningReportCollectForm',
    detail: 'tranningDetail'
  },
  manager: {
    managerName: 'manager',
    center: 'managerCenter',
    create: 'managerCreate'
  },
  namespace: {
    namespaceName: 'namespace',
    personalSetting: 'namespacePersonalSetting',
    management: 'namespacePersonalManagement'
  },
  inviteMember: 'inviteMember',
  namespaceSwitch: 'namespaceSwitch',
  endPlatform: {
    adCollectForm: 'endPlatformadCollectForm'
  }
}

const coreRoutes = [
  {
    path: '/',
    component: () => import('@/views/home/index.vue'),
    children: [
      {
        name: RoutesMap.home.index,
        path: '',
        component: () => import('@/views/home/home.vue')
      },
      {
        name: RoutesMap.home.case,
        path: 'case',
        component: () => import('@/views/home/case.vue')
      }
    ]
  },
  {
    name: RoutesMap.home.nash,
    path: '/nash',
    component: () => import('@/views/nash/index.vue')
    // meta: { title: '云南纳什智能科技有限公司' }
  },
  {
    name: RoutesMap.auth.login,
    path: '/auth/login',
    component: () => import('@/views/auth/LoginView.vue')
    // meta: { title: '登录' }
  },
  {
    name: RoutesMap.auth.verify,
    path: '/auth/verify',
    component: () => import('@/views/auth/VerifyView.vue')
    // meta: { title: '审核中' }
  },
  {
    name: RoutesMap.auth.logout,
    path: '/auth/logout',
    component: () => import('@/views/auth/LogoutView.vue')
    // meta: { title: '退出登录' }
  },
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
      }
    ]
  },
  {
    name: RoutesMap.safe,
    path: '/link',
    component: () => import('@/views/redirect/RedirectView.vue')
    // meta: { title: '安全中心' }
  },
  {
    name: RoutesMap.endPlatform.adCollectForm,
    path: '/endPlatform/adCollectForm/:formId/:uid',
    component: () => import('@/views/endPlatform/AdCollectForm.vue')
  }
]

// 发布机器人对话
const asyncRoutes = [
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
  }
]

// 对话
const chatRoutes = [
  {
    path: 'c',
    component: () => import('@/views/chat/index.vue'),
    meta: {
      title: '对话',
      requiresAuth: true
    },
    children: [
      {
        name: RoutesMap.chat.c,
        path: 'bot/:botSlug',
        // meta: { title: '聊天' },
        component: () => import('@/views/chating/ChatItem.vue')
      }
    ]
  }
]

// 资源广场
const resourceSquareRoutes = [
  {
    name: RoutesMap.resource,
    path: 'resource',
    meta: {
      // title: '资源广场',
      requiresAuth: true
    },
    component: () => import('@/views/resource/square.vue')
  }
]

// 训练机器人
const trainningRoutes = [
  {
    path: 't',
    component: () => import('@/views/bot/index.vue'),
    redirect: '/error/404',
    children: [
      {
        name: RoutesMap.tranning.bot,
        // 训练中心-当前机器人
        path: 'bot/:botId',
        meta: { requiresAuth: true },
        children: [
          {
            name: RoutesMap.tranning.botUser,
            path: 'user',
            component: () => import('@/views/bot/user/UserInterface.vue')
            // meta: { title: '形象' }
          },
          {
            name: RoutesMap.tranning.botPersona,
            path: 'persona',
            component: () => import('@/views/bot/persona/PersonaView.vue')
            // meta: { title: '规则' }
          },
          {
            path: 'content',
            component: RouterView,
            redirect: { name: RoutesMap.tranning.botContentQA },
            children: [
              {
                name: RoutesMap.tranning.botContentQA,
                path: 'qa',
                component: () => import('@/views/bot/content/QAView.vue')
                // meta: { title: '问答式' }
              },
              {
                name: RoutesMap.tranning.botContentDoc,
                path: 'doc',
                component: () => import('@/views/bot/content/DocView.vue')
                // meta: { title: '文档式' }
              }
            ]
          },
          {
            name: RoutesMap.tranning.botRelease,
            path: 'release',
            component: RouterView,
            redirect: { name: RoutesMap.tranning.botReleaseChannel },
            children: [
              {
                name: RoutesMap.tranning.botReleaseChannel,
                path: '',
                component: () => import('@/views/bot/release/ReleaseView.vue')
                // meta: { title: '发布媒介' }
              },
              {
                name: RoutesMap.tranning.botReleaseSetting,
                path: 'setting',
                component: () => import('@/views/bot/release/ReleaseSetting.vue')
                // meta: { title: '发布设置' }
              }
            ]
          },
          {
            name: RoutesMap.tranning.botChat,
            path: 'chat',
            component: () => import('@/views/bot/chat/ChatView.vue')
            // meta: { title: '调试' }
          },
          {
            path: 'report',
            component: RouterView,
            redirect: { name: RoutesMap.tranning.report },
            children: [
              {
                name: RoutesMap.tranning.report,
                path: '',
                component: () => import('@/views/bot/report/ReportView.vue')
                // meta: { title: '数据概览' }
              },
              {
                name: RoutesMap.tranning.reportCollectForm,
                path: 'collect',
                component: () => import('@/views/bot/report/ReportCollectForm.vue')
              },
              {
                path: 'detail',
                component: RouterView,
                children: [
                  {
                    name: RoutesMap.tranning.reportDetail,
                    path: '',
                    component: () => import('@/views/bot/report/ReportDetail.vue')
                    // meta: { title: '对话消息明细' }
                  },
                  {
                    name: RoutesMap.tranning.reportContext,
                    path: 'context/:chatId',
                    component: () => import('@/views/bot/report/ReportContext.vue')
                    // meta: { title: '上下文信息' }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]

// 管理机器人
const managerRoutes = [
  {
    path: 'manager',
    meta: {
      name: 'manager',
      // title: '机器人信息',
      requiresAuth: true
    },
    component: RouterView,
    children: [
      {
        name: RoutesMap.manager.center,
        path: 'center',
        component: () => import('@/views/manage/BotList.vue')
        // meta: { title: '管理机器人' }
      },
      {
        name: RoutesMap.manager.create,
        path: 'create',
        component: () => import('@/views/manage/BotCreate.vue')
        // meta: { title: '创建机器人' }
      }
    ]
  }
]

// 空间
const spaceManager = [
  {
    path: 'space',
    component: RouterView,
    children: [
      {
        name: RoutesMap.namespace.personalSetting,
        // meta: { title: '个人设置' },
        path: 'personal',
        component: () => import('@/views/space/personalSetting.vue')
      },
      {
        // meta: { title: '空间管理' },
        path: ':spaceId',
        component: () => import('@/views/space/index.vue'),
        children: [
          {
            name: RoutesMap.namespace.management,
            path: '',
            component: () => import('@/views/space/personalSpace.vue')
          }
        ]
      }
    ]
  }
]

// 邀请用户
const inviteMember = [
  {
    name: RoutesMap.inviteMember,
    path: '/invite',
    component: () => import('@/views/invite/InviteMember.vue')
  }
]

const namespaceSwitch = [
  {
    name: RoutesMap.namespaceSwitch,
    path: '/spaceSwitch',
    component: () => import('@/views/space/spaceSwitch.vue')
  }
]

const loginedRoutes = [
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      ...chatRoutes, // 对话
      ...trainningRoutes, // 训练中心
      ...managerRoutes, // 管理机器人
      ...resourceSquareRoutes, // 资源广场
      ...spaceManager
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
  routes: [
    ...coreRoutes,
    ...asyncRoutes,
    ...loginedRoutes,
    ...inviteMember,
    ...namespaceSwitch,
    ...finalRoutes
  ] as any
})

router.beforeEach((to) => {
  const { drawerVisible } = useSidebar()
  drawerVisible.value = false

  locationComToCn()
  useRoleCheck(to)
  usePageTitle(to.meta?.title)
  const authStoreI = useAuthStore()
  if (to.meta.requiresAuth && !authStoreI.authToken) {
    let query
    // 通过 redirect 参数保存当前所在的位置，以便登录后返回
    // 如果当前是首页，就不用存了，因为登录后默认回首页
    if (to.fullPath !== '/') query = { redirect: to.fullPath }
    return {
      path: '/auth/login',
      query
    }
  }
})

router.afterEach((to) => {
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
