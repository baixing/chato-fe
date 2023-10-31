<script setup lang="ts">
import useSpaceRights from '@/composables/useSpaceRights'
import { currentEnvConfig } from '@/config'
import { PaidCommercialTypes } from '@/constant/space'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import { EAccountSettingStatus, EAppletcStatus } from '@/enum/release'
import type { ICreateAccountRes } from '@/interface/release'
import { useBase } from '@/stores/base'
import { useDomainStore } from '@/stores/domain'
import { useSpaceStore } from '@/stores/space'
import { copyPaste } from '@/utils/help'
import {
  ChatDotRound,
  CirclePlus,
  CopyDocument,
  Document,
  FullScreen,
  Tools,
  UploadFilled,
  View
} from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRefs,
  watch,
  type Ref
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useSessionStorage } from '@vueuse/core'
import ReleaseBox from './ReleaseBox.vue'

const SerachApi = defineAsyncComponent(() => import('./apiCall/SerachApi.vue'))
const ApplicationForm = defineAsyncComponent(() => import('./application/ApplicationForm.vue'))
const BrandDomain = defineAsyncComponent(() => import('./brandDomain/BrandDomainIndex.vue'))
const CreateFeishu = defineAsyncComponent(() => import('./feishuPublic/CreateFeishu.vue'))
const DrawerSite = defineAsyncComponent(() => import('./implantJs/DrawerSite.vue'))
const SetEffectSite = defineAsyncComponent(() => import('./implantJs/SetEffectSite.vue'))
const OfficialAccont = defineAsyncComponent(() => import('./officialAccount/OfficialAccont.vue'))
const EmPower = defineAsyncComponent(() => import('./tiktok/EmPower.vue'))
const Copylink = defineAsyncComponent(() => import('./webPage/Copylink.vue'))
const CreatePoster = defineAsyncComponent(() => import('./gzhPoster/SharePoster.vue'))
const CreateChat = defineAsyncComponent(() => import('./weixinChat/CreateChat.vue'))
const DrawerChat = defineAsyncComponent(() => import('./weixinChat/DrawerChat.vue'))
const WeixinService = defineAsyncComponent(() => import('./weixinService/WeixinService.vue'))
const CreateDing = defineAsyncComponent(() => import('./dingDing/CreateDing.vue'))
const CreateAccount = defineAsyncComponent(() => import('./weixinChat/CreateAccount.vue'))
const DrawerAccount = defineAsyncComponent(() => import('./weixinChat/DrawerAccount.vue'))
const CreateApplet = defineAsyncComponent(() => import('./applet/CreateApplet.vue'))
const DrawerApplet = defineAsyncComponent(() => import('./applet/DrawerApplet.vue'))

const route = useRoute()
const { t } = useI18n()
const base = useBase()
const spaceStoreI = useSpaceStore()
const domainStoreI = useDomainStore()
const { userInfo, orgInfo, userCommercialType } = storeToRefs(base)
const { currentRights } = storeToRefs(spaceStoreI)
const { domainInfo } = storeToRefs(domainStoreI)
const userRoute = `/t/bot/${domainInfo.value.id}/roleInfo`
const botSlug = computed(() => domainInfo.value.slug)
const botId = computed(() => domainInfo.value.id)
const chatWebPageBaseURL = `${currentEnvConfig.baseURL}`
const chatReleaseURL = computed(() => {
  return {
    chatWebPage: `${currentEnvConfig.wwwBaseURL}/b/${botSlug.value}`,
    chatAPI: `${chatWebPageBaseURL}/chato/api-public/domains/${botSlug.value}/chat`
  }
})
const chatScript = `${currentEnvConfig.scriptURL}/assets/iframe.min.js`
const wssApiDocs =
  'https://apifox.com/apidoc/shared-74401769-7cc9-4d75-a57e-892dc6aa5960/api-95610185'
const weixinServiceDocs = 'https://baixingwang.feishu.cn/docx/CXyTdSKF6oPCiLxAQTacrHvUnfe'
const appletConfigDocs = 'https://baixingwang.feishu.cn/docx/C2shd2MHfo7aPfxkUl8cJVJMnGf'

const accountQrCode = ref<ICreateAccountRes>()
const accountCreateStatus = ref<EAccountSettingStatus>(EAccountSettingStatus.creating)
const defaultAppletcStatus = ref<EAppletcStatus>()
const releaseChannel = useSessionStorage('releaseChannel', '')

const features = reactive({
  showDrawerChatVisible: false, // 查看群聊
  createGroupChatVisible: false, // 创建群聊
  configAccountVisible: false, // 配置公众号
  showCopyLinkVisbile: false, // 网页-复制链接
  siteListVisible: false, // 站点列表
  createSiteVisible: false, // 创建站点
  brandDomainVisible: false, // 域名部署
  feiShuVisible: false, // 飞书
  weixinService: false, // 微信客服
  tiktokService: false, // 抖音
  dingDingVisible: false, // 钉钉
  showCopyApiVisible: false, // API 调用
  createAccountVisible: false, // 微信聊天-创建账号
  drawerAccountVisible: false, // 微信聊天-查看聊天
  createAppletVisible: false, // 小程序-扫码授权
  drawerAppletVisible: false, // 小程序-查看授权结果
  createPoster: false // 海报
})

const {
  showDrawerChatVisible,
  createGroupChatVisible,
  configAccountVisible,
  showCopyLinkVisbile,
  siteListVisible,
  createSiteVisible,
  brandDomainVisible,
  feiShuVisible,
  weixinService,
  tiktokService,
  dingDingVisible,
  showCopyApiVisible,
  createAccountVisible,
  drawerAccountVisible,
  createAppletVisible,
  drawerAppletVisible,
  createPoster
} = toRefs(features)

const { checkRightsTypeNeedUpgrade, isAllowedCommercialType } = useSpaceRights()

const createWeixinChat = async () => {
  const needUpgrade = await checkRightsTypeNeedUpgrade(ESpaceRightsType.groupChat)
  if (needUpgrade) {
    return
  }
  createGroupChatVisible.value = true
}

const createWeixinAccount = async () => {
  const needUpgrade = isAllowedCommercialType(PaidCommercialTypes)
  if (!needUpgrade) {
    return checkRightsTypeNeedUpgrade(ESpaceRightsType.default)
  }
  const limited = await checkRightsTypeNeedUpgrade(ESpaceRightsType.weixinAccount)
  if (limited) {
    return checkRightsTypeNeedUpgrade(ESpaceRightsType.default)
  }
  createAccountVisible.value = true
}

// 蒙层
const maskVisible = computed(() => {
  return !base.orgInfo.visible && ESpaceCommercialType.free === userCommercialType.value
})

const handleUpdateOrgInfo = () => {
  base.updateOrgInfo({
    ...orgInfo.value,
    visible: true
  })
}

// 预览体验
const handlePreview = (e: string) => {
  window.open(e)
}

const commonVisible = (visibleRef: Ref<boolean>) => {
  visibleRef.value = true
}

// 域名部署
const brandDomain = async () => {
  if (!currentRights.value.dns) {
    checkRightsTypeNeedUpgrade(ESpaceRightsType.brand)
    return
  }
  brandDomainVisible.value = true
}

// 重启账号
const handleRestartAccount = (row: ICreateAccountRes) => {
  accountQrCode.value = row
  createAccountVisible.value = true
  accountCreateStatus.value = EAccountSettingStatus.restart
}

// 创建账号
const handleCreateAccount = () => {
  accountCreateStatus.value = EAccountSettingStatus.creating
  createGroupChatVisible.value = true
  accountQrCode.value = null
}

const releaseList = [
  {
    icon: 'wangye',
    title: t('网页'),
    desc: t('用户在此链接可以直接和您的机器人聊天'),
    setList: [
      {
        icon: CopyDocument,
        label: t('复制链接'),
        scriptId: 'Chato-copy-link',
        click: () => commonVisible(showCopyLinkVisbile)
      },
      {
        icon: View,
        label: t('预览体验'),
        scriptId: 'Chato-preview-chat',
        click: () => handlePreview(chatReleaseURL.value.chatWebPage)
      },
      {
        icon: UploadFilled,
        label: t('域名部署'),
        scriptId: 'Chato-brand-domain',
        click: brandDomain
      }
    ]
  },
  {
    icon: 'wechat-pyq',
    title: t('朋友圈'),
    desc: t('用户扫码后，可直接和您的机器人聊天'),
    setList: [
      {
        icon: View,
        label: t('生成海报'),
        scriptId: 'Chato-preview-chat',
        click: () => commonVisible(createPoster)
      }
    ]
  },
  {
    icon: 'js-qianru',
    title: t('JS嵌入'),
    desc: t('可添加到网站的任何位置，将此 iframe 添加到 html 代码中'),
    setList: [
      {
        icon: CirclePlus,
        label: t('创建站点'),
        scriptId: 'Chato-setted-effect-site',
        click: () => commonVisible(createSiteVisible)
      },
      {
        icon: View,
        label: t('查看代码'),
        scriptId: 'Chato-copy-code',
        click: () => commonVisible(siteListVisible)
      }
    ]
  },
  {
    icon: 'api-diaoyong',
    title: t('API调用'),
    desc: t('通过API，可直接进行调用或发出请求'),
    setList: [
      {
        icon: View,
        label: t('接口秘钥'),
        scriptId: 'Chato-fetch-api',
        click: () => commonVisible(showCopyApiVisible)
      },
      {
        icon: Document,
        label: t('接口文档'),
        scriptId: 'Chato-api-document',
        click: () => handlePreview(wssApiDocs)
      }
    ]
  },
  {
    icon: 'weixin-qun',
    title: t('微信聊天'),
    desc: t('使用企微账号自动回复微信用户单/群聊信息'),
    setList: [
      {
        icon: Tools,
        label: t('创建账号'),
        scriptId: 'Chato-account-create',
        click: createWeixinAccount
      },
      {
        icon: View,
        label: t('查看账号'),
        scriptId: 'Chato-account-view',
        click: () => commonVisible(drawerAccountVisible)
      },
      {
        icon: ChatDotRound,
        label: t('创建聊天'),
        scriptId: 'Chato-group-create',
        click: createWeixinChat
      },
      {
        icon: View,
        label: t('查看聊天'),
        scriptId: 'Chato-group-view',
        click: () => commonVisible(showDrawerChatVisible)
      }
    ]
  },
  {
    icon: 'weixin-public',
    title: t('微信公众号'),
    desc: t('可在微信公众号后台配置，提供机器人服务'),
    setList: [
      {
        icon: Tools,
        label: t('配置公众号'),
        scriptId: 'Chato-public-set',
        click: () => commonVisible(configAccountVisible)
      }
    ]
  },
  {
    icon: 'feishu-public',
    title: t('飞书'),
    desc: t('在飞书群/单聊中提供机器人服务，仅限内部员工使用'),
    setList: [
      {
        icon: Tools,
        label: t('配置飞书'),
        scriptId: 'Chato-feishu-set',
        click: () => commonVisible(feiShuVisible)
      }
    ]
  },
  {
    icon: 'weixin-service',
    title: t('微信客服'),
    desc: t('使用企微回复用户在微信咨询的消息，扫码即可实现与机器人1V1聊天'),
    setList: [
      {
        icon: Tools,
        label: t('配置微信客服'),
        scriptId: 'Chato-weixin-service-set',
        click: () => commonVisible(weixinService)
      },
      {
        icon: Document,
        label: t('配置文档'),
        scriptId: 'Chato-weixin-api-document',
        click: () => handlePreview(weixinServiceDocs)
      }
    ]
  },
  {
    icon: 'tiktok',
    title: t('抖音'),
    desc: t('配置完成后，机器人可自动回复私信'),
    setList: [
      {
        icon: FullScreen,
        label: t('扫码授权'),
        scriptId: 'Chato-tiktok-set',
        click: () => commonVisible(tiktokService)
      }
    ]
  },
  {
    icon: 'dingding',
    title: t('钉钉'),
    desc: t('在群/单聊中提供机器人服务，仅限内部员工使用'),
    setList: [
      {
        icon: Tools,
        label: t('配置钉钉'),
        scriptId: 'Chato-dingding-set',
        click: () => commonVisible(dingDingVisible)
      }
    ]
  },
  {
    icon: 'applet',
    title: t('微信小程序'),
    desc: t('支持企业授权绑定小程序，提供机器人服务'),
    setList: [
      {
        icon: FullScreen,
        label: t('扫码授权'),
        scriptId: 'Chato-applet-set',
        click: () => commonVisible(createAppletVisible)
      },
      {
        icon: View,
        label: t('查看小程序'),
        scriptId: 'Chato-applet-view',
        click: () => commonVisible(drawerAppletVisible)
      },
      {
        icon: Document,
        label: t('配置文档'),
        scriptId: 'Chato-applet-document',
        click: () => handlePreview(appletConfigDocs)
      }
    ]
  }
]

const handleCopyButtonClick = (e: MouseEvent) => {
  e.stopPropagation()
  copyPaste((e.target as HTMLElement).querySelector('.text').innerHTML)
}

watch(
  () => route.query,
  (v) => {
    if (v.releaseChannel && v.releaseChannel !== releaseChannel.value) {
      releaseChannel.value = v.releaseChannel as string
      defaultAppletcStatus.value = EAppletcStatus.empowerSuccess
      createAppletVisible.value = true
    }
  },
  { immediate: true }
)

watch(createAccountVisible, (v) => {
  !v && (accountCreateStatus.value = EAccountSettingStatus.creating)
})

onMounted(() => {
  const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const copyBtns = document.querySelectorAll('.copy-btn-code')
        // 移除旧的点击事件监听器
        copyBtns.forEach((btn) => {
          btn.removeEventListener('click', handleCopyButtonClick)
        })

        // 添加新的点击事件监听器
        copyBtns.forEach((btn) => {
          btn.addEventListener('click', handleCopyButtonClick)
        })
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

<template>
  <div class="release-drawer-container">
    <template v-if="!maskVisible">
      <div class="mx-auto my-0">
        <div class="overflow-hidden flex flex-wrap justify-between">
          <ReleaseBox
            v-for="item in releaseList"
            :key="item.icon"
            :svgName="item.icon"
            :title="item.title"
            :desc="item.desc"
          >
            <div
              class="icon-set-container text-[#b5bed0] cursor-pointer gap-2 text-xs flex items-center justify-center mr-[16px] md:mr-[6px]"
              @click="ic.click"
              v-for="ic in item.setList"
              :key="ic.label"
            >
              <el-icon>
                <component :is="ic.icon" />
              </el-icon>
              {{ ic.label }}
            </div>
          </ReleaseBox>
        </div>
      </div>
      <div
        class="flex justify-center items-center text-[#9da3af] font-medium text-sm mt-[36px] md:text-xs"
      >
        {{ $t('发布平台持续迭代中，如有其他发布诉求请反馈至') }}
        <el-button
          type="primary"
          link
          @click="checkRightsTypeNeedUpgrade(ESpaceRightsType.default)"
        >
          {{ $t('产品顾问') }}
        </el-button>
      </div>
    </template>
    <ApplicationForm
      v-else
      @handleUpdateOrgInfo="handleUpdateOrgInfo"
      :orgId="userInfo.org.id"
      :orgUserId="userInfo.id"
    />
    <BrandDomain :slug="botSlug" v-model:value="brandDomainVisible" />
    <DrawerSite
      v-model:value="siteListVisible"
      :slug="botSlug"
      :chatScript="chatScript"
      :chatWebPage="chatReleaseURL.chatWebPage"
      :wwwBaseURL="currentEnvConfig.wwwBaseURL"
      :baseURL="chatWebPageBaseURL"
    >
    </DrawerSite>
    <OfficialAccont
      v-model:value="configAccountVisible"
      @handleCopyLink="copyPaste"
      :link="chatReleaseURL.chatWebPage"
      :slugId="botSlug"
    />
    <SetEffectSite
      v-model:value="createSiteVisible"
      :slug="domainInfo.slug"
      @showDrawerSite="() => (siteListVisible = true)"
    />
    <DrawerChat
      v-model:value="showDrawerChatVisible"
      :domainId="domainInfo.id"
      :baseURL="currentEnvConfig.baseURL"
      :userRoute="userRoute"
      :robotNickname="domainInfo.name"
      :endpoint="chatReleaseURL.chatAPI"
    />
    <CreateChat
      v-model:value="createGroupChatVisible"
      :chatAPI="chatReleaseURL.chatAPI"
      :userRoute="userRoute"
      :domainId="domainInfo.id"
      :robotNickname="domainInfo.name"
      :orgId="userInfo.org.id"
      :mobileNumber="userInfo.mobile"
      :domainSlug="domainInfo.slug"
      :welcome="domainInfo.welcome"
      @handleCreateAccount="createAccountVisible = true"
    />
    <SerachApi v-model:value="showCopyApiVisible" :chatAPI="domainInfo.token" :slug="botSlug" />
    <Copylink v-model:value="showCopyLinkVisbile" :chatWebPage="chatReleaseURL.chatWebPage" />
    <CreatePoster v-model:value="createPoster" :domainId="botId" />
    <CreateFeishu :slug="domainInfo.slug" v-model:value="feiShuVisible" />
    <WeixinService v-model:value="weixinService" :domainSlug="domainInfo.slug" />
    <EmPower v-model:value="tiktokService" :domainSlug="botSlug" />
    <CreateDing v-model:value="dingDingVisible" :domainSlug="botSlug" />
    <CreateAccount
      v-model:value="createAccountVisible"
      :orgId="userInfo.org.id"
      :createStatus="accountCreateStatus"
      :defaultAccountQrCode="accountQrCode"
      @UpdateCreateChatVisible="handleCreateAccount"
    />
    <DrawerAccount
      v-model:value="drawerAccountVisible"
      :orgId="userInfo.org.id"
      @handleRestartAccount="handleRestartAccount"
    />
    <CreateApplet
      v-model:value="createAppletVisible"
      :defaultAppletcStatus="defaultAppletcStatus"
      :domainId="domainInfo.id"
      @handleView="drawerAppletVisible = true"
    />
    <DrawerApplet
      v-model:value="drawerAppletVisible"
      :domainId="domainInfo.id"
      @handleRetry="createAppletVisible = true"
    />
  </div>
</template>

<style lang="scss" scoped>
.icon-set-container {
  &:hover {
    @apply text-[#7c5cfc];
  }
}
</style>

<style lang="scss">
.release-drawer-container {
  .el-drawer__header {
    @apply mb-5 text-[#303133] font-medium;
  }
  .el-drawer__body {
    @apply pt-0;
  }
  .el-collapse {
    @apply border-t-0;
  }
  .el-form-item__label {
    @apply text-sm text-[#303133];
  }
}
</style>
