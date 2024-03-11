<template>
  <div
    class="bg-[url('@/assets/img/home-header.png')] relative bg-right-top bg-contain bg-no-repeat bg-fixed h-full w-full overflow-hidden"
  >
    <el-header
      :class="[
        'w-full h-20 flex justify-between items-center px-[10%] absolute  z-[2] bg-right-top bg-no-repeat bg-cover transition-colors ease-out',
        headerShowBg ? 'bg-[#ffffffe6]' : 'bg-transparent'
      ]"
    >
      <div class="flex items-end gap-2">
        <img
          id="Chato_logo_click"
          data-sensors-click
          src="@/assets/img/logo-header.png"
          alt=""
          class="w-[140px] h-auto cursor-pointer lg:w-[100px]"
          @click="onEnter()"
        />
        <el-tag
          v-if="!isMobile"
          round
          size="small"
          effect="light"
          class="!text-gray-500 !border-none !bg-gray-200"
        >
          Beta
        </el-tag>
        <ul v-if="!isMobile" class="flex gap-8 text-[#303133] text-sm ml-12">
          <li
            v-for="(item, index) in menuRouteList"
            :key="`menu_route_${index}`"
            :index="item.key"
            :class="['menu-route', activeMenuRouteName === item?.key && 'active']"
            @click="() => onLinkRoute(item.key)"
          >
            {{ item.title }}
          </li>
        </ul>
      </div>
      <el-select
        v-if="isMobile"
        v-model="activeMenuRouteName"
        class="menu-select"
        @change="(v) => onLinkRoute(v)"
        style="--el-select-input-focus-border-color: transparent"
        :style="{ width: activeMenuRouteName === RoutesMap.home.index ? '72px' : '110px' }"
      >
        <el-option
          v-for="item in menuRouteList"
          :key="item.key"
          :label="item.title"
          :value="item.key"
        />
      </el-select>
      <div class="button-container">
        <el-button
          link
          :class="['!text-[#606266] !font-normal', 'mr-1', isMobile ? 'w-[22px]' : '']"
          @click="toggleButton(locale === ELangKey.en ? ELangKey.zh_cn : ELangKey.en)"
        >
          {{ checkbutton[locale] }}
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <el-button
          :data-script="authToken ? 'Chato-enter' : 'Chato-login'"
          class="w-auto h-9 rounded-lg !text-sm hover:!scale-105"
          type="primary"
          id="Chato_login_click"
          @click="onEnter()"
        >
          {{ authToken ? $t('进入') : $t('免费使用') }}
        </el-button>
      </div>
    </el-header>
    <div
      ref="homeContainer"
      id="homeContainer"
      class="h-full overflow-auto"
      @scroll="scrollCallback"
    >
      <router-view @enter="onEnter" />

      <div
        v-if="showFooterVisible"
        :class="[
          'home-center-padding',
          'flex',
          'gap-20',
          'justify-center',
          'items-center',
          'mt-16',
          'mb-20',
          'lg:flex-col',
          'lg:gap-10',
          'lg:mb-10',
          locale === ELangKey.en ? 'flex-wrap' : ''
        ]"
      >
        <div>
          <img
            src="@/assets/img/logo-header.png"
            alt=""
            class="block w-[140px] h-auto lg:w-[100px] lg:m-auto"
          />
          <div class="flex text-xs mt-4 mb-3">
            <el-button
              link
              type="info"
              size="small"
              class="!text-[#9DA3AF] !font-normal hover:opacity-80"
              @click="() => openPreviewUrl(kPrivacyLinkUrl)"
            >
              {{ $t('隐私政策') }}
            </el-button>
            <el-button
              link
              type="info"
              size="small"
              class="!text-[#9DA3AF] !font-normal hover:opacity-80"
              @click="() => openPreviewUrl(kUserAgreementLinkUrl)"
            >
              {{ $t('服务条款') }}
            </el-button>
            <el-button
              link
              type="info"
              size="small"
              id="Chato_bottom_company_click"
              class="!text-[#9DA3AF] !font-normal hover:opacity-80"
              @click="onLinkNash"
              >{{ $t('云南纳什智能科技有限公司') }}</el-button
            >
          </div>
          <p class="!text-[#9DA3AF] text-xs flex items-center justify-center gap-1 lg:text-center">
            © 2023 Chato
            <el-link
              type="info"
              href="https://beian.miit.gov.cn/"
              class="!text-xs !font-normal !text-[#9DA3AF] hover:opacity-80"
              :underline="false"
              >{{ $t('滇ICP备2023003615号-1') }}</el-link
            >
          </p>
        </div>
        <div
          v-for="item in footerQrCode"
          :key="item.label"
          class="flex items-center justify-center text-[12px] text-[#9DA3AF] lg:flex-col lg:last:mb-5"
        >
          <div
            class="shrink-0 mr-[12px] leading-5 text-[14px] text-left lg:text-center lg:mb-[5px]"
          >
            <p class="mb-[5px] text-[#3D3D3D]">{{ $t(item.label) }}</p>
            <p>{{ $t(item.desc) }}</p>
          </div>
          <img :src="item.img" class="w-[106px] h-[106px]" alt="" />
        </div>
      </div>
    </div>
    <div
      v-if="showFooterContactVisible"
      class="home-contact-btn text-base absolute flex flex-col gap-[14px] overflow-hidden py-5 px-2 md:p-0 right-7 md:right-2"
    >
      <template v-if="!isMobile">
        <div
          class="fixed-btn"
          id="Chato_right_service_click"
          data-sensors-click
          @click="onAdvisory"
        >
          <svg-icon class="text-xl mb-[4px]" svg-class="w-5 h-5" name="wechat" />
          <span v-if="!isMobile" class="scale-90">{{ $t('咨询客服') }}</span>
        </div>
        <div id="Chato_right_login_click" data-sensors-click @click="onEnter()" class="fixed-btn">
          <svg-icon class="text-xl mb-[4px]" name="free-experience" />
          <span v-if="!isMobile" class="scale-90">{{ $t('免费使用') }}</span>
        </div>
        <div
          class="fixed-btn"
          id="Chato_right_reserve_click"
          data-sensors-click
          @click="scheduleMask = true"
        >
          <svg-icon class="text-xl mb-[4px]" svg-class="w-5 h-5" name="phone-outlined" />
          <span v-if="!isMobile" class="scale-90">{{ $t('预约演示') }}</span>
        </div>
      </template>
      <div
        v-if="headerShowBg"
        @click="handleScrollTop"
        :class="['fixed-btn', isMobile && 'w-9 h-9 rounded-full']"
      >
        <svg-icon class="text-xl" name="return-top" />
        <span v-if="!isMobile" class="mt-1">{{ $t('返回') }}</span>
      </div>
    </div>
  </div>
  <PreviewVideo v-model:visible="videoMask" />
  <ScheduleDemoModal v-model:visible="scheduleMask" />
  <UpgradeRightsModal />
  <JoinDemoModal v-model:visible="joinMask" />
  <div
    v-if="isMobile && activeMenuRouteName !== RoutesMap.home.homeChat"
    class="fixed left-12 right-12 bottom-5 h-11 z-[999]"
  >
    <el-button
      class="affix-box !w-full !h-[46px] !text-sm !text-white font-medium !rounded-lg border-none border-0 shadow-none"
      @click="onEnter()"
    >
      <svg-icon class="text-sm mr-1" name="gift" />
      <span>{{ $t('免费领取') }}</span>
      <span class="text-[#FFE74A] p-1">{{ '100' }}</span>
      <span>{{ $t('对话额度') }}</span>
    </el-button>
  </div>
</template>
<script setup lang="ts">
import baixingAI from '@/assets/img/home/baixing-ai.png'
import homeInvestJoin from '@/assets/img/home/home-invest-join.jpg'
import nashCrcode from '@/assets/img/nash-crcode.jpeg'
import { useBasicLayout } from '@/composables/useBasicLayout'
import useGlobalProperties from '@/composables/useGlobalProperties'
import useSpaceRights from '@/composables/useSpaceRights'
import { kPrivacyLinkUrl, kUserAgreementLinkUrl } from '@/constant/terms'
import { ELangKey } from '@/enum/locales'
import { ESpaceRightsType } from '@/enum/space'
import { EAllRole } from '@/enum/user'
import { checkbutton } from '@/locales'
import { RoutesMap } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { useChatStore } from '@/stores/chat'
import { useLocales } from '@/stores/locales'
import { openPreviewUrl } from '@/utils/help'
import { chatoIframe } from '@/utils/iframe'
import { useDebounceFn, useStorage } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import type { Ref } from 'vue'
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import WOW from 'wow.js'

const PreviewVideo = defineAsyncComponent(() => import('./components/PreviewVideo.vue'))
const ScheduleDemoModal = defineAsyncComponent(
  () => import('./components/Schedule/ScheduleDemoModal.vue')
)
const UpgradeRightsModal = defineAsyncComponent(
  () => import('@/components/Upgrade/UpgradeRightsModal.vue')
)
const JoinDemoModal = defineAsyncComponent(() => import('./components/Join/JoinDemoModal.vue'))

const $uid = useStorage('uid', '')
const { setLocale } = useLocales()
const { locale } = storeToRefs(useLocales())
const route = useRoute()
const { t } = useI18n()
const router = useRouter()
const baseStoreI = useBase()
const chatStoreI = useChatStore()
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const { userInfo } = storeToRefs(baseStoreI)
const { chatList } = storeToRefs(chatStoreI)

const homeContainer = ref<HTMLElement>(null)
const headerShowBg = ref(false)
const userCommunityLink = 'https://support.qq.com/products/600388/'

const scrollCallback = useDebounceFn((e) => {
  if (e.target.scrollTop > 80) {
    headerShowBg.value = true
  } else {
    headerShowBg.value = false
  }
}, 10)

const toggleButton = (langKey) => {
  setLocale(langKey)
  location.reload()
}

const { isMobile } = useBasicLayout()
const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const onLinkNash = () => {
  const routerData = router.resolve({
    path: `/nash`
  })
  window.open(routerData.href, '_blank')
}

const videoMask = ref(false)
const scheduleMask = ref(false)
const joinMask = ref(false)

const onEnter = (type?: string) => {
  if (type === 'Chato_top_video_click') {
    videoMask.value = true
    return
  }
  if (type === 'Chato_top_resource_click') {
    router.push({ name: RoutesMap.home.homeChat, params: { botSlug: 'square' } })
    return
  }

  if (type === 'Chato_bottom_conact_click' || type === 'Chato_case_bottom_wechat_click') {
    checkRightsTypeNeedUpgrade(ESpaceRightsType.default, false)
    return
  }

  if (authToken.value) {
    if (EAllRole.member === userInfo.value?.role) {
      router.push({ name: RoutesMap.home.homeResource })
    } else {
      router.push({ name: RoutesMap.manager.center })
    }
  } else {
    router.push({ name: RoutesMap.auth.login })
  }
}

const onContactUs = (display = 'block') => {
  const containerEl = document.getElementById('inframe_container')
  containerEl && (containerEl.style.display = display)
}

const onAdvisory = () => {
  if (isMobile.value) {
    checkRightsTypeNeedUpgrade(ESpaceRightsType.default, false)
    return
  } else {
    onContactUs()
  }
}

const onFormModal = (showRef: Ref) => {
  if (showRef.value) {
    return
  }

  showRef.value = true
}

const handleScrollTop = () => {
  if (!homeContainer.value) return
  homeContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
}

const activeMenuRouteName = computed(() => route.name as string)
const menuRouteList = [
  { title: t('首页'), key: RoutesMap.home.index },
  { title: t('客户案例'), key: RoutesMap.home.case },
  { title: t('联系我们'), key: 'menu_schedule' },
  { title: t('渠道合作'), key: 'menu_join' },
  { title: t('用户社区'), key: 'menu_community' },
  // { title: t('资源广场'), key: RoutesMap.home.homeResource },
  { title: t('对话Chato'), key: RoutesMap.home.homeChat }
]

const footerQrCode = [
  { label: '百姓AI', desc: '掌握AI前沿资讯', img: baixingAI },
  { label: '关注纳什智能', desc: '先人一步运用AI', img: nashCrcode },
  { label: '渠道负责人', desc: '李经理', img: homeInvestJoin }
]

const showFooterName = [RoutesMap.home.index, RoutesMap.home.case]

const showFooterVisible = computed(() => {
  return showFooterName.includes(activeMenuRouteName.value)
})

const showFooterContactName = [
  RoutesMap.home.index,
  RoutesMap.home.case,
  RoutesMap.home.homeResource
]

const showFooterContactVisible = computed(() => {
  return showFooterContactName.includes(activeMenuRouteName.value)
})

const onLinkRoute = (key: string) => {
  switch (key) {
    case 'menu_join':
      onFormModal(joinMask)
      break
    case 'menu_schedule':
      onFormModal(scheduleMask)
      break
    case 'menu_community':
      window.open(userCommunityLink)
      break
    case 'homeChat':
      router.push({
        name: key,
        params: {
          ...route.params,
          botSlug: 'square'
        }
      })
      break
    default:
      router.push({
        name: key,
        params: {
          ...route.params,
          botSlug: chatList.value.length > 0 ? chatList.value[0].slug : ''
        }
      })
  }
}

const initUid = () => {
  if (!$uid.value || $uid.value === 'undefined') {
    $uid.value = uuidv4()
  }
}

const { $sensors } = useGlobalProperties()

const init = async () => {
  await chatStoreI.initChatList()

  if (!authToken.value) {
    return
  }

  const res = await baseStoreI.getUserInfo()
  res?.id && $sensors?.login(res.id.toString())
}

let contactTimer = null

const onRegisterContactUS = () => {
  window.ChatoBotConfig = {
    baseURL: 'https://api.chato.cn',
    wwwBaseURL: 'https://chato.cn',
    token: 'kv9ez5y8qxp7l3m4',
    id: 835
  }
  chatoIframe()
  if (route.name !== RoutesMap.home.homeChat) {
    contactTimer = setTimeout(() => {
      onContactUs()
    }, 5000)
  }
}

onMounted(() => {
  const wow = new WOW({
    offset: 50, // 定义浏览器视口底部与隐藏框顶部之间的距离。当用户滚动并到达此距离时，隐藏的框会显示出来。
    mobile: true, // 在移动设备上打开/关闭 WOW.js。
    live: true, // 在页面上同时检查新的 WOW 元素。
    scrollContainer: '#homeContainer'
  })
  wow.init()

  initUid()
  init()
  !isMobile.value && onRegisterContactUS()
})

onBeforeUnmount(() => {
  const iframeContainerEl = document.getElementById('inframe_container')
  iframeContainerEl?.remove()
})

watch(
  () => route.name,
  () => {
    if (route.name === RoutesMap.home.homeChat) {
      onContactUs('none')
    } else {
      if (!contactTimer) {
        contactTimer = setTimeout(() => {
          onContactUs()
        }, 5000)
      }
    }
  }
)
</script>
<style lang="scss" scoped>
.home-contact-btn {
  position: fixed;
  box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.16);
  border: 1px solid #e4e7ed;
  background: #fff;
  border-radius: 32px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  bottom: 32px;
}

.fixed-btn {
  @apply flex items-center justify-center;

  flex-direction: column;
  border-bottom: 1px solid #e4e7ed;
  color: #303133;
  background-color: white;
  padding-bottom: 14px;
  transition: all 0.2s ease-in-out;

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  &:hover {
    color: #7c5cfc;
  }
}

.menu-route {
  @apply transition-colors cursor-pointer hover:text-[#7C5CFC];

  &.active {
    @apply text-[#7C5CFC] relative;

    &::after {
      position: absolute;
      content: '';
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 16px;
      height: 3px;
      background: #7c5cfc;
      border-radius: 2px;
    }
  }
}

.menu-select {
  width: 100px;

  :deep(.el-input__wrapper) {
    background-color: transparent;
    box-shadow: none !important;
  }
}
.button-container {
  display: flex;
  gap: 1rem; /* Adjust the gap size as needed */
}

.affix-box {
  background: linear-gradient(117deg, #0547ff -84%, #d683ff 125%);
  animation: affix-link 1.5s linear infinite;
}

@keyframes affix-link {
  0% {
    box-shadow: 0 0 #7c5cfcbf;
  }
  100% {
    box-shadow: 0 0 0 12px #faad1400;
  }
}
</style>
