<script setup lang="ts">
import SpaceRightsFreeExpUpgrate from '@/components/Space/SpaceRightsFreeExpUpgrate.vue'
import SpaceRightsMask from '@/components/Space/SpaceRightsMask.vue'
import useSpaceRights from '@/composables/useSpaceRights'
import { currentEnvConfig } from '@/config'
import { FreeCommercialTypeExperienceDay } from '@/constant/space'
import { EAccountSettingStatus } from '@/enum/release'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import type { ICreateAccountRes } from '@/interface/release'
import { useBase } from '@/stores/base'
import { useDomainStore } from '@/stores/domain'
import { useSpaceStore } from '@/stores/space'
import { copyPaste } from '@/utils/help'
import { getSpecifiedDateSinceNowDay } from '@/utils/timeRange'
import { Document, FullScreen, Tools, View } from '@element-plus/icons-vue'
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
import ReleaseBox from './components/ReleaseBox.vue'

const ApplicationForm = defineAsyncComponent(
  () => import('./components/application/ApplicationForm.vue')
)
const CreateFeishu = defineAsyncComponent(
  () => import('./components/feishuPublic/CreateFeishu.vue')
)
const OfficialAccont = defineAsyncComponent(
  () => import('./components/officialAccount/OfficialAccont.vue')
)
const EmPower = defineAsyncComponent(() => import('./components/tiktok/EmPower.vue'))
const DrawerChat = defineAsyncComponent(() => import('./components/weixinChat/DrawerChat.vue'))
const WeixinService = defineAsyncComponent(
  () => import('./components/weixinService/WeixinService.vue')
)
const CreateDing = defineAsyncComponent(() => import('./components/dingDing/CreateDing.vue'))
const CreateAccount = defineAsyncComponent(
  () => import('./components/weixinChat/CreateAccount.vue')
)
const DrawerAccount = defineAsyncComponent(
  () => import('./components/weixinChat/DrawerAccount.vue')
)

const { t } = useI18n()
const base = useBase()
const domainStoreI = useDomainStore()
const spaceStoreI = useSpaceStore()
const { userInfo, orgInfo, userCommercialType } = storeToRefs(base)
const { domainInfo } = storeToRefs(domainStoreI)
const { currentRights } = storeToRefs(spaceStoreI)
const userRoute = `/t/bot/${domainInfo.value.id}/roleInfo`
const botSlug = computed(() => domainInfo.value.slug)
const chatWebPageBaseURL = `${currentEnvConfig.baseURL}`
const chatReleaseURL = computed(() => {
  return {
    chatWebPage: `${currentEnvConfig.wwwBaseURL}/b/${botSlug.value}`,
    chatAPI: `${chatWebPageBaseURL}/chato/api-public/domains/${botSlug.value}/chat`
  }
})
const weixinServiceDocs = 'https://baixingwang.feishu.cn/docx/CXyTdSKF6oPCiLxAQTacrHvUnfe'

const accountQrCode = ref<ICreateAccountRes>()
const accountCreateStatus = ref<EAccountSettingStatus>(EAccountSettingStatus.creating)

const specifiedBetweenDay = getSpecifiedDateSinceNowDay(orgInfo.value.created)
const rightsMaskVisible = computed(
  () =>
    currentRights.value.type === ESpaceCommercialType.free &&
    specifiedBetweenDay > FreeCommercialTypeExperienceDay
)

const features = reactive({
  showDrawerChatVisible: false, // 查看群聊
  configAccountVisible: false, // 配置公众号
  showCopyLinkVisbile: false, // 网页-复制链接
  siteListVisible: false, // 站点列表
  createSiteVisible: false, // 创建站点
  brandDomainVisible: false, // 域名部署
  feiShuVisible: false, // 飞书
  weixinService: false, // 微信客服
  tiktokService: false, // 抖音
  dingDingVisible: false, // 钉钉
  createAccountVisible: false, // 微信聊天-创建账号
  drawerAccountVisible: false, // 微信聊天-查看聊天
  createAppletVisible: false, // 小程序-扫码授权
  drawerAppletVisible: false, // 小程序-查看授权结果
  createPoster: false, // 海报
  domainVerificationVisible: false // 小程序-域名校验
})

const {
  showDrawerChatVisible,
  configAccountVisible,
  feiShuVisible,
  weixinService,
  tiktokService,
  dingDingVisible,
  createAccountVisible,
  drawerAccountVisible
} = toRefs(features)

const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const createWeixinAccount = async () => {
  const needUpgrade = await checkRightsTypeNeedUpgrade(ESpaceRightsType.weixinAccount)
  if (needUpgrade) {
    return
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

// 重启账号
const handleRestartAccount = (row: ICreateAccountRes) => {
  accountQrCode.value = row
  createAccountVisible.value = true
  accountCreateStatus.value = EAccountSettingStatus.restart
}

// 创建账号
const handleCreateAccount = () => {
  accountCreateStatus.value = EAccountSettingStatus.creating
  accountQrCode.value = null
}
const releaseList = [
  {
    icon: 'weixin-qun',
    title: t('企微托管'),
    desc: t('绑定企业自有企微账号，实现企微一对一自动回复及群聊自动回复功能'),
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
  }
]

const handleCopyButtonClick = (e: MouseEvent) => {
  e.stopPropagation()
  copyPaste((e.target as HTMLElement).querySelector('.text').innerHTML)
}

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
      <p class="text-lg text-[#303133] font-medium">{{ $t('全部渠道') }}</p>
      <div class="flex justify-start items-center text-[#9da3af] text-sm mt-3 mb-7 md:text-xs">
        {{ $t('发布平台持续迭代中，如有其他发布诉求请反馈至') }}
        <el-button
          type="primary"
          link
          @click="checkRightsTypeNeedUpgrade(ESpaceRightsType.default)"
        >
          {{ $t('产品顾问') }}
        </el-button>
      </div>
      <div class="mx-auto my-0">
        <div class="overflow-hidden flex flex-wrap justify-between">
          <ReleaseBox
            v-for="item in releaseList"
            :key="item.icon"
            :svgName="item.icon"
            :title="item.title"
            :desc="item.desc"
            class="relative"
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
            <SpaceRightsMask :visible="rightsMaskVisible">
              <SpaceRightsFreeExpUpgrate upgrade-link upgrade-text="该功能为付费权益" />
            </SpaceRightsMask>
          </ReleaseBox>
        </div>
      </div>
    </template>
    <ApplicationForm
      v-else
      @handleUpdateOrgInfo="handleUpdateOrgInfo"
      :orgId="userInfo.org.id"
      :orgUserId="userInfo.id"
    />
    <OfficialAccont
      v-model:value="configAccountVisible"
      @handleCopyLink="copyPaste"
      :link="chatReleaseURL.chatWebPage"
      :slugId="botSlug"
    />
    <DrawerChat
      v-model:value="showDrawerChatVisible"
      :domainId="domainInfo.id"
      :baseURL="currentEnvConfig.baseURL"
      :userRoute="userRoute"
      :robotNickname="domainInfo.name"
      :endpoint="chatReleaseURL.chatAPI"
      :slugId="botSlug"
    />
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
