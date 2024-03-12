import useChannel from '@/composables/useChannel'
import usePageTitle from '@/composables/usePageTitle'
import useRoleCheck from '@/composables/useRoleCheck'
import useSidebar from '@/composables/useSidebar'
import { useAuthStore } from '@/stores/auth'
import Sensors from '@/utils/sensors'
import { locationComToCn } from '@/utils/url'
import { nextTick } from 'vue'
import { RouterView, createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

export const RoutesMap = {
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
    navigator: 'navigator'
  },
  flow: {
    index: 'flowIndex',
    intention: 'flowIntention'
  },
  activity: {
    index: 'activityIndex',
    message: 'activityMessage'
  },
  resource: 'resource',
  tranning: {
    bot: 'tranningBot',
    roleInfo: 'tranningRoleInfo',
    knowledge: 'tranningKnowledge',
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
    first: 'guideFirst',
    yzl: 'youzanLoading'
  },
  namespaceSwitch: 'namespaceSwitch',
  endPlatform: {
    adCollectForm: 'endPlatformadCollectForm'
  },
  pay: {
    payRediect: 'payRediect'
  },
  aiPlugin: {
    center: 'aipluginCenter',
    detail: 'aipluginDetail',
    yz: 'Youzan'
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
      },
      {
        path: 'bot',
        children: [
          {
            name: RoutesMap.home.homeChat,
            path: ':botSlug',
            component: () => import('@/views/home/homeChat.vue')
          }
        ]
      }
    ]
  },
  {
    name: RoutesMap.home.nash,
    path: '/nash',
    component: () => import('@/views/nash/index.vue')
  },
  {
    path: '/wxh/:botSlug',
    component: () => import('@/views/wxh/index.vue')
  },
  {
    path: '/wjs/:botSlug',
    component: () => import('@/views/wjs/index.vue')
  },
  {
    name: RoutesMap.auth.login,
    path: '/auth/login',
    component: () => import('@/views/auth/LoginView.vue')
  },
  {
    name: RoutesMap.auth.loginInvite,
    path: '/auth/loginInvite',
    component: () => import('@/views/auth/LoginInvitationView.vue')
  },
  {
    name: RoutesMap.auth.logout,
    path: '/auth/logout',
    component: () => import('@/views/auth/LogoutView.vue')
  },
  {
    path: '/error',
    component: RouterView,
    children: [
      {
        path: '403',
        component: () => import('@/views/error/Error403.vue')
      },
      {
        path: '404',
        component: () => import('@/views/error/Error404.vue')
      },
      {
        path: '500',
        component: () => import('@/views/error/Error500.vue')
      }
    ]
  },
  {
    name: RoutesMap.safe,
    path: '/link',
    component: () => import('@/views/redirect/RedirectView.vue')
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
        component: () => import('@/views/chat/shareChat.vue')
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
        name: RoutesMap.chat.navigator,
        path: 'bot/chato_navigator',
        component: () => import('@/components/Chat/ChatoNavigator.vue')
      },
      {
        name: RoutesMap.home.homeResource,
        path: 'bot/square',
        component: () => import('@/views/resource/square.vue')
      },
      {
        name: RoutesMap.chat.c,
        path: 'bot/:botSlug',
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
    redirect: { name: RoutesMap.home.homeResource }
  }
]

// AI插件库()
const aiPluginSquareRoutes = [
  {
    path: '/aiplugin',
    component: RouterView,
    children: [
      {
        name: RoutesMap.aiPlugin.yz,
        path: 'yz',
        component: () => import('@/views/aiplugin/YouzanCreate.vue')
      }
    ]
  }
  //   {
  //     path: 'aiplugin',
  //     meta: {
  //       name: 'aiplugin',
  //       requiresAuth: true
  //     },
  //     component: RouterView,
  //     children: [
  //       {
  //         name: RoutesMap.aiPlugin.center,
  //         path: 'center',
  //         component: () => import('@/views/aiplugin/index.vue')
  //       },
  //       {
  //         name: RoutesMap.aiPlugin.detail,
  //         path: 'detail/:name',
  //         component: () => import('@/views/aiplugin/detail.vue')
  //       }
  //     ]
  //   }
]

// 训练机器人
const trainningRoutes = [
  {
    path: 't',
    component: () => import('@/views/training/index.vue'),
    redirect: '/error/404',
    children: [
      {
        name: RoutesMap.tranning.bot,
        // 训练中心-当前机器人
        path: 'bot/:botId',
        meta: { requiresAuth: true },
        children: [
          {
            name: RoutesMap.tranning.botChat,
            path: 'chat',
            component: () => import('@/views/training/chat/index.vue')
          },
          {
            name: RoutesMap.tranning.roleInfo,
            path: 'roleInfo/:type?',
            component: () => import('@/views/training/roleInfo/index.vue')
          },
          {
            path: 'knowledge',
            component: () => import('@/views/training/knowledge/layout.vue'),
            children: [
              {
                name: RoutesMap.tranning.knowledge,
                path: ':type?',
                component: () => import('@/views/training/knowledge/index.vue')
              }
            ]
          },
          {
            name: RoutesMap.tranning.release,
            path: 'release/:type?',
            component: () => import('@/views/training/release/index.vue')
          },
          {
            name: RoutesMap.tranning.report,
            path: 'report/:type?/:chatId?',
            component: () => import('@/views/training/report/index.vue')
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
      requiresAuth: true
    },
    component: RouterView,
    children: [
      {
        name: RoutesMap.manager.center,
        path: 'center',
        component: () => import('@/views/manage/BotList.vue')
      },
      {
        name: RoutesMap.manager.create,
        path: 'create/:botId?/:opt?/:botSlug?',
        component: () => import('@/views/manage/BotCreate.vue')
      },
      {
        name: RoutesMap.manager.createByDoc,
        path: 'createByDoc',
        component: () => import('@/views/manage/BotCreateByDoc.vue')
      }
    ]
  }
]

// 工作流
const flowManager = [
  {
    path: 'flow',
    component: RouterView,
    children: [
      {
        name: RoutesMap.flow.index,
        path: '',
        component: () => import('@/views/flow/index.vue')
      },
      {
        name: RoutesMap.flow.intention,
        path: ':flowId/intention',
        component: () => import('@/views/flow/intention.vue')
      }
    ]
  }
]

// 活动
const activityManager = [
  {
    path: 'activity',
    component: RouterView,
    children: [
      {
        name: RoutesMap.activity.index,
        path: '',
        component: () => import('@/views/activity/index.vue')
      },
      {
        name: RoutesMap.activity.message,
        path: ':activityId/message',
        component: () => import('@/views/activity/message.vue')
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
        path: 'personal',
        component: () => import('@/views/space/personalSetting.vue')
      },
      {
        name: RoutesMap.namespace.income,
        path: 'income',
        component: () => import('@/views/space/personalIncome.vue')
      },
      {
        name: RoutesMap.namespace.summary,
        path: 'summary/:type?',
        component: () => import('@/views/space/summarySpace.vue')
      },
      {
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

// vip
const vipManager = [
  {
    path: 'vip',
    component: RouterView,
    children: [
      {
        name: RoutesMap.vip.center,
        path: 'center',
        component: () => import('@/views/vip/center.vue')
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

// 引导
const guideRoutes = [
  {
    name: RoutesMap.guide.first,
    path: '/guide/first',
    component: () => import('@/views/guide/firstGuide.vue')
  },
  {
    name: RoutesMap.guide.yzl,
    path: '/guide/yzl',
    component: () => import('@/views/aiplugin/YouzanLoading.vue')
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
      ...aiPluginSquareRoutes, // AI插件库
      ...spaceManager,
      ...flowManager,
      ...activityManager
      // ...vipManager
    ]
  }
]

// pay redirect
const payRedirect = [
  {
    name: RoutesMap.pay.payRediect,
    path: '/pay/redirect',
    beforeEnter: (to, from, next) => {
      const redirectUrl = to.query.redirect
      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        next('/error/404') // 或者 next(Error('redirect URL not provided'));
      }
    }
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
    ...finalRoutes,
    ...guideRoutes,
    ...payRedirect
  ] as RouteRecordRaw[]
})

router.beforeEach((to) => {
  const { drawerVisible } = useSidebar()
  const { shareChannel } = useChannel()
  const sensors = new Sensors()
  const { saInstance } = sensors
  drawerVisible.value = false

  locationComToCn()
  useRoleCheck(to)
  usePageTitle(to.meta?.title)
  saInstance?.track('channel-source', {
    name: 'channel来源',
    type: 'channel-source',
    data: shareChannel
  })
  // useCheckDomain(to)
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
