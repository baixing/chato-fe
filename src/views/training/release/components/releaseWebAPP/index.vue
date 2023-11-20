<script setup lang="ts">
import { updateDomain } from '@/api/domain'
import IconReward from '@/assets/img/Icon-Reward.png'
import SpaceRightsFreeExpUpgrate from '@/components/Space/SpaceRightsFreeExpUpgrate.vue'
import SpaceRightsMask from '@/components/Space/SpaceRightsMask.vue'
import useGlobalProperties from '@/composables/useGlobalProperties'
import useSpaceRights from '@/composables/useSpaceRights'
import { currentEnvConfig } from '@/config'
import { FreeCommercialTypeExperienceDay } from '@/constant/space'
import { EAppletcStatus } from '@/enum/release'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { useDomainStore } from '@/stores/domain'
import { useSpaceStore } from '@/stores/space'
import { copyPaste } from '@/utils/help'
import { getSpecifiedDateSinceNowDay } from '@/utils/timeRange'
import {
  CirclePlus,
  CopyDocument,
  Document,
  Tools,
  UploadFilled,
  View
} from '@element-plus/icons-vue'
import { useSessionStorage } from '@vueuse/core'
import dayjs from 'dayjs'
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
import { useRoute, useRouter } from 'vue-router'
import ReleaseBox from '../releaseView/components/ReleaseBox.vue'

const ApplicationForm = defineAsyncComponent(
  () => import('../releaseView/components/application/ApplicationForm.vue')
)
const BrandDomain = defineAsyncComponent(
  () => import('./components/brandDomain/BrandDomainIndex.vue')
)
const DrawerSite = defineAsyncComponent(() => import('./components/implantJs/DrawerSite.vue'))
const SetEffectSite = defineAsyncComponent(() => import('./components/implantJs/SetEffectSite.vue'))
const Copylink = defineAsyncComponent(() => import('./components/webPage/Copylink.vue'))
const CreatePoster = defineAsyncComponent(() => import('./components/gzhPoster/SharePoster.vue'))
const ExperienceApplet = defineAsyncComponent(
  () => import('./components/applet/ExperienceApplet.vue')
)
const CreateApplet = defineAsyncComponent(() => import('./components/applet/CreateApplet.vue'))
const VerificationTxt = defineAsyncComponent(
  () => import('./components/applet/VerificationTxt.vue')
)
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const base = useBase()
const visible = ref(false)
const spaceStoreI = useSpaceStore()
const domainStoreI = useDomainStore()
const { userInfo, orgInfo, userCommercialType } = storeToRefs(base)
const { currentRights } = storeToRefs(spaceStoreI)
const { domainInfo } = storeToRefs(domainStoreI)
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
const defaultAppletcStatus = ref<EAppletcStatus>()
const releaseChannel = useSessionStorage('releaseChannel', '')

const specifiedBetweenDay = getSpecifiedDateSinceNowDay(orgInfo.value.created)
const rightsMaskVisible = computed(
  () =>
    currentRights.value.type === ESpaceCommercialType.free &&
    specifiedBetweenDay > FreeCommercialTypeExperienceDay
)

const features = reactive({
  showCopyLinkVisbile: false, // 网页-复制链接
  siteListVisible: false, // 站点列表
  createSiteVisible: false, // 创建站点
  brandDomainVisible: false, // 域名部署
  createPoster: false, // 海报
  createAppletVisible: false, // 小程序-扫码授权
  linkAppletVisible: false, // 小程序-链接小程序
  empowerAppletVisible: false, // 小程序-覆盖已有的
  verificationAppletVisible: false // 小程序-嵌入已有
})

const {
  showCopyLinkVisbile,
  siteListVisible,
  createSiteVisible,
  brandDomainVisible,
  createAppletVisible,
  createPoster,
  linkAppletVisible,
  empowerAppletVisible,
  verificationAppletVisible
} = toRefs(features)

const { checkRightsTypeNeedUpgrade } = useSpaceRights()

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

const postReview = async () => {
  if (domainInfo.value.task_progress[2] === 0) {
    domainInfo.value.task_progress[2] = 20
    await updateDomain(domainInfo.value.id, {
      task_progress: domainInfo.value.task_progress
    })
    setTimeout(() => {
      visible.value = false
    }, 2000)
    visible.value = true
    sensorsTaskProgress()
  }
}

const sensorsTaskProgress = () => {
  $sensors?.track('mission_completed', {
    name: t('任务完成'),
    type: 'mission_completed',
    data: {
      task_progress: 2,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })
}

const commonVisible = (visibleRef: Ref<boolean>, show: boolean = false) => {
  postReview()
  if (show) {
    checkRightsTypeNeedUpgrade(ESpaceRightsType.default, true)
  }
  visibleRef.value = !show
}

// 域名部署
const brandDomain = async () => {
  if (!currentRights.value.dns) {
    checkRightsTypeNeedUpgrade(ESpaceRightsType.brand)
    return
  }
  brandDomainVisible.value = true
}

const { $sensors } = useGlobalProperties()
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
    icon: 'applet',
    title: t('微信小程序'),
    desc: t('支持企业通过以下三种不同的方式，将机器人应用在微信小程序中'),
    setList: [
      {
        icon: Tools,
        label: t('获取小程序链接'),
        scriptId: 'Chato-applet-link',
        click: () => commonVisible(linkAppletVisible)
      },
      {
        icon: View,
        label: t('嵌入已有小程序'),
        scriptId: 'Chato-applet-iframe',
        click: () => commonVisible(verificationAppletVisible, rightsMaskVisible.value)
      },
      {
        icon: Document,
        label: t('覆盖已有小程序'),
        scriptId: 'Chato-applet-cover',
        click: () => commonVisible(empowerAppletVisible, rightsMaskVisible.value)
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
        click: () => {
          postReview()
          commonVisible(createPoster)
          $sensors.track('bot_poster_click', {
            bot_id: botId.value
          })
        }
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
  }
]

const upgradationName = ['wangye', 'applet']

const handleCopyButtonClick = (e: MouseEvent) => {
  e.stopPropagation()
  copyPaste((e.target as HTMLElement).querySelector('.text').innerHTML)
}

const onHandleSetPay = () => {
  router.push({
    name: RoutesMap.tranning.release,
    params: {
      botId: botId.value,
      type: 'settings'
    }
  })
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
      <div class="mx-auto mb-6">
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
              class="icon-set-container text-[#b5bed0] cursor-pointer gap-2 text-xs flex items-center justify-center mr-[16px] md:mr-[6px] md:mb-2"
              @click="ic.click"
              v-for="ic in item.setList"
              :key="ic.label"
            >
              <el-icon>
                <component :is="ic.icon" />
              </el-icon>
              {{ ic.label }}
            </div>
            <SpaceRightsMask :visible="rightsMaskVisible && !upgradationName.includes(item.icon)">
              <SpaceRightsFreeExpUpgrate upgrade-link upgrade-text="该功能为付费权益" />
            </SpaceRightsMask>
          </ReleaseBox>
        </div>
      </div>
      <!-- 付费问答 -->
      <!-- <div class="w-full p-6 rounded-lg" style="border: 1px solid #e4e7ed">
        <p class="text-[#303133] text-base font-medium">{{ $t('你还可以设置付费问答') }}</p>
        <p class="text-[#596780] text-sm mt-4 mb-5">
          {{ $t('作为机器人创作者，可以将您的创作成果分享出去，让更多人使用并获取报酬') }}
        </p>
        <el-button
          type="primary"
          style="--el-button-bg-color: #fff; --el-button-text-color: #7c5cfc"
          class="flex-shrink-0 !px-8"
          @click="onHandleSetPay"
        >
          {{ $t('去设置') }}
        </el-button>
      </div> -->
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
    <SetEffectSite
      v-model:value="createSiteVisible"
      :slug="domainInfo.slug"
      @showDrawerSite="() => (siteListVisible = true)"
    />
    <Copylink v-model:value="showCopyLinkVisbile" :chatWebPage="chatReleaseURL.chatWebPage" />
    <CreatePoster v-model:value="createPoster" :domainId="botId" />
    <ExperienceApplet v-model:value="linkAppletVisible" :slug="domainInfo.slug" />
    <CreateApplet
      v-model:value="empowerAppletVisible"
      :domainId="domainInfo.id"
      :defaultAppletcStatus="defaultAppletcStatus"
    />
    <VerificationTxt
      v-model:value="verificationAppletVisible"
      :chatAPI="chatReleaseURL.chatWebPage"
    />
  </div>
  <Modal
    v-model:visible="visible"
    :width="300"
    class="!p-0 flex justify-center !pb-4"
    :slotHeader="false"
    :footer="false"
  >
    <div class="h-[150px] flex justify-center">
      <img :src="IconReward" class="w-[200px] h-full object-cover" />
    </div>
    <div class="text-center mt-4 text-[#3D3D3D] text-base font-medium mb-3">
      {{ $t('恭喜你，完成') }} <span class="text-[#7C5CFC]">{{ $t('发布分享') }}</span>
      {{ $t('任务') }}
    </div>
    <!-- <div class="text-[#596780] text-xs text-center">
      {{ $t('获得电力值') }} <span class="text-[#7C5CFC]">+100</span>
    </div> -->
  </Modal>
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
