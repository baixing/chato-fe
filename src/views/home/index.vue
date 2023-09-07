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
        <el-tag round size="small" effect="light" class="!text-gray-500 !border-none !bg-gray-200">
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
        :style="{ width: activeMenuRouteName === RoutesMap.home.index ? '72px' : '100px' }"
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
          type="text"
          class="!text-[#303133] !font-normal"
          @click="toggleButton(locale === ELangKey.en ? ELangKey.zh_cn : ELangKey.en)"
          >{{ checkbutton[locale] }}<el-icon class="el-icon--right"><ArrowDown /></el-icon
        ></el-button>
        <el-button
          :data-script="authToken ? 'Chato-enter' : 'Chato-login'"
          class="w-auto h-9 rounded-lg !text-sm hover:!scale-105"
          type="primary"
          id="Chato_login_click"
          @click="onEnter()"
        >
          {{ authToken ? $t('进入') : $t('免费体验') }}
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
        class="home-center-padding flex gap-20 justify-center items-center mt-16 mb-20 lg:flex-col lg:gap-10 lg:mb-10"
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
        <div class="flex gap-4 items-center text-[#3D3D3D] text-sm lg:flex-col">
          <span>{{ $t('扫码关注') }}</span>
          <img
            src="@/assets/img/nash-crcode.jpeg"
            class="w-[106px] h-[106px] rounded-lg overflow-hidden"
          />
        </div>

        <!-- 招商加盟 -->
        <div class="flex items-center justify-center text-[12px] text-[#9DA3AF] lg:flex-col">
          <div class="mr-[12px] leading-5 text-[14px] text-left lg:text-center lg:mb-[5px]">
            <p class="mb-[5px] text-[#3D3D3D]">{{ $t('渠道合作') }}</p>
            <p>{{ $t('郑经理') }}</p>
            <p><a class="text-[#9DA3AF]" href="tel:13916182066">13916182066</a></p>
          </div>
          <img :src="homeInvestJoin" class="w-[106px] h-[106px]" alt="" />
        </div>
      </div>
    </div>

    <div
      class="home-contact-btn py-5 px-[7px] md:py-4 md:px-[10px] text-base absolute right-7 md:right-1 flex flex-col gap-[14px]"
    >
      <div class="fixed-btn" id="Chato_right_service_click" data-sensors-click @click="onContactUs">
        <svg-icon class="text-xl mb-[4px]" svg-class="w-5 h-5" name="wechat" />
        <span v-if="!isMobile" class="scale-90">{{ $t('微信咨询') }}</span>
      </div>
      <div id="Chato_right_login_click" data-sensors-click @click="onEnter()" class="fixed-btn">
        <svg-icon class="text-xl mb-[4px]" name="free-experience" />
        <span v-if="!isMobile" class="scale-90">{{ $t('免费体验') }}</span>
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
      <div v-if="headerShowBg" @click="handleScrollTop" class="fixed-btn">
        <svg-icon class="text-xl mb-[4px]" name="return-top" />
        <span v-if="!isMobile">{{ $t('返回') }}</span>
      </div>
    </div>
  </div>
  <PreviewVideo v-model:visible="videoMask" />
  <ScheduleDemoModal v-model:visible="scheduleMask" />
  <UpgradeRightsModal />
  <JoinDemoModal v-model:visible="joinMask" />
</template>
<script setup lang="ts">
import homeInvestJoin from '@/assets/img/home/home-invest-join.png'
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
import { useLocales } from '@/stores/locales'
import { openPreviewUrl } from '@/utils/help'
import { ArrowDown } from '@element-plus/icons-vue'
import { useDebounceFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
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

const { setLocale } = useLocales()
const { locale } = storeToRefs(useLocales())
const route = useRoute()
const { t } = useI18n()
const router = useRouter()
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const baseStoreI = useBase()
const { userInfo } = storeToRefs(baseStoreI)

const homeContainer = ref<HTMLElement>(null)
const headerShowBg = ref(false)

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

  if (type === 'Chato_bottom_conact_click') {
    checkRightsTypeNeedUpgrade(ESpaceRightsType.default)
    return
  }

  if (authToken.value) {
    if (EAllRole.member === userInfo.value?.role) {
      router.push({ name: RoutesMap.resource })
    } else {
      router.push({ name: RoutesMap.manager.center })
    }
  } else {
    router.push({ name: RoutesMap.auth.login })
  }
}

const onContactUs = () => {
  checkRightsTypeNeedUpgrade(ESpaceRightsType.default)
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
  { title: t('渠道合作'), key: 'menu_join' }
]

const onLinkRoute = (key: string) => {
  if (key === 'menu_join') {
    onFormModal(joinMask)
  } else if (key === 'menu_schedule') {
    onFormModal(scheduleMask)
  } else {
    router.push({ name: key })
  }
}

const { $sensors } = useGlobalProperties()

const init = async () => {
  if (!authToken.value) {
    return
  }

  const res = await baseStoreI.getUserInfo()
  res?.id && $sensors?.login(res.id.toString())
}

onMounted(() => {
  const wow = new WOW({
    offset: 100, // 定义浏览器视口底部与隐藏框顶部之间的距离。当用户滚动并到达此距离时，隐藏的框会显示出来。
    mobile: true, // 在移动设备上打开/关闭 WOW.js。
    live: true, // 在页面上同时检查新的 WOW 元素。
    scrollContainer: '#homeContainer'
  })
  wow.init()

  init()
})
</script>
<style lang="scss" scoped>
.home-contact-btn {
  position: fixed;
  box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.16);
  border: 1px solid #e4e7ed;
  background: #ffffff;
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
</style>
