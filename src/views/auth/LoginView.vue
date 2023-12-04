<template>
  <div class="w-full h-full overflow-hidden bg-white flex justify-center items-center">
    <div v-if="!isMobile">
      <LoginHeader />
      <div
        class="p-3 mt-10 md:mt-3 m-auto border border-solid border-[#E4E7ED] md:border-none rounded-lg"
      >
        <BindingMobile
          v-if="isbindingMobile"
          :userId="userId"
          @loginEnterSuccess="loginEnterSuccess"
          @handleRescanCode="handleRescanCode"
        />
        <template v-else>
          <div v-if="!isMobile" class="flex justify-end items-center">
            <div
              class="login-tip relative w-[110px] text-[#596780] text-center py-2 bg-[#F2F3F5] rounded-md mr-[9px]"
            >
              {{ $t(LoginWayConfig[loginWay]) }}
            </div>
            <svg-icon
              class="!w-[66.25px] !h-[66px] cursor-pointer"
              :name="loginWay"
              @click="handleChangeLoginWay"
            />
          </div>
          <div class="px-8 md:px-0 pb-3 w-[360px]">
            <component
              :is="loginComponent[loginWay]"
              :timeout="timeout"
              :url="url"
              @handleSubmitLogin="handleSubmitLogin"
              @handleRefresh="handleRefreshQR"
              :loading="loading"
            />
          </div>
        </template>
      </div>
    </div>
    <MobileStyle v-else @handleSubmitLogin="handleSubmitLogin"></MobileStyle>
  </div>
</template>

<script lang="ts" setup>
import { getLoginQRCodeAPI, getLoginQREmpowerStatusAPI, postLoginAPI } from '@/api/auth'
import { addSpaceMember } from '@/api/space'
import { useIsMobile } from '@/composables/useBasicLayout'
import useChannel from '@/composables/useChannel'
import useGlobalProperties from '@/composables/useGlobalProperties'
import useInvite from '@/composables/useInvite'
import { LoginWayConfig } from '@/constant/auth'
import { ELoginEmpowerStatus, ELoginWay } from '@/enum/auth'
import type { ILoginQRCodeEmpowerResult, ILoginQRCodeResult } from '@/interface/auth'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { $notnull } from '@/utils/help'
import { useStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { ElLoading, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import BindingMobile from './components/BindingMobile.vue'
import LoginHeader from './components/LoginHeader.vue'
import LoginMobile from './components/LoginMobile.vue'
import LoginWeixin from './components/LoginWeixin.vue'
import MobileStyle from './components/MobileStyle.vue'
const { t } = useI18n()
const stateToken = useStorage('auth_token', '')
const { shareChannel, setShareChannel } = useChannel()
const { invite_ticket } = useInvite()
const isMobile = useIsMobile()
const { $sensors } = useGlobalProperties()
const router = useRouter()
const route = useRoute()
const baseStoreI = useBase()
const redir = route.query.redirect || '/'
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const loginWay = ref<ELoginWay>(isMobile ? ELoginWay.loginScanCode : ELoginWay.loginMobile)
const isbindingMobile = ref<boolean>(false)
const loginQRCodeRes = ref<ILoginQRCodeResult>(null)
const loginQRCodeEmpowerStatusRes = ref<ILoginQRCodeEmpowerResult>(null)
const timer = ref(null)
const timeout = ref(false)
const loading = ref(true)

const userId = computed(() => {
  return $notnull(loginQRCodeEmpowerStatusRes.value) &&
    !!loginQRCodeEmpowerStatusRes.value.external_user_id
    ? loginQRCodeEmpowerStatusRes.value.external_user_id
    : ''
})
const url = computed(() => {
  return $notnull(loginQRCodeRes.value) ? loginQRCodeRes.value.url : ''
})
const routeUrl = computed(() => (route.query.redirect as string) || '/manager/center')
const isLoggedIn = computed(() => !!authToken.value)
if (isLoggedIn.value) {
  router.replace(redir as string)
}

const loginComponent = {
  [ELoginWay.loginScanCode]: LoginMobile,
  [ELoginWay.loginMobile]: LoginWeixin
}

const handleChangeLoginWay = () => {
  loginWay.value =
    loginWay.value === ELoginWay.loginScanCode ? ELoginWay.loginMobile : ELoginWay.loginScanCode
}

// ---- 业务打点-----
const scanCodeSuccessRBI = (id: string) => {
  $sensors?.track('sms_scan_code_login_success', {
    name: t('扫码登录成功'),
    type: 'sms_scan_code_login_success',
    data: {
      id,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })
}
// ----------------

// ---- 微信扫码-----
const getLoginQRCode = async () => {
  try {
    loading.value = true
    const res = await getLoginQRCodeAPI()
    loginQRCodeRes.value = res.data.data
  } catch (error) {
  } finally {
    loading.value = false
    timeout.value = false
  }
}

const serachQREmpowerStatus = async (session: string) => {
  const res = await getLoginQREmpowerStatusAPI({ session })
  const serachRes = res.data.data
  loginQRCodeEmpowerStatusRes.value = serachRes
  if (serachRes.status !== ELoginEmpowerStatus.waiting) {
    clearInterval(timer.value)
  }
  switch (serachRes.status) {
    case ELoginEmpowerStatus.timeout: // 过期了
      timeout.value = true
      break
    case ELoginEmpowerStatus.success: // 登录成功
      scanCodeSuccessRBI(serachRes.external_user_id)
      loginEnterSuccess(serachRes.token, shareChannel.value)
      break
    case ELoginEmpowerStatus.need_bind_mobile: // 绑定手机号
      isbindingMobile.value = true
      break
  }
}

const handleRefreshQR = async () => {
  await getLoginQRCode()
  pollingQREmpowerStatus()
}

const pollingQREmpowerStatus = () => {
  timer.value = setInterval(() => {
    serachQREmpowerStatus(loginQRCodeRes.value.session)
  }, 1000)
}

const handleRescanCode = () => {
  isbindingMobile.value = false
  loginQRCodeEmpowerStatusRes.value = null
  handleRefreshQR()
}
// ----------

// ----- 登录 ----
const enterSpaceValidate = async (invite_ticket: string) => {
  const res = await addSpaceMember({ invite_ticket })
  const addSpaceRes = res.data
  stateToken.value = addSpaceRes.data.token
}

const loginEnterSuccess = async (token: string, channel: string, close?: () => void) => {
  authStoreI.setToken(token)
  if (channel === 'invite' && invite_ticket.value) {
    await enterSpaceValidate(invite_ticket.value as string)
  }
  const userInfo = await baseStoreI.getUserInfo()
  userInfo?.id && $sensors?.login(userInfo?.id.toString())
  router.replace(routeUrl.value)
  setShareChannel(channel)
  close && close()
}

const handleSubmitLogin = async (postData: any) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('登录中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    const res = await postLoginAPI(postData)
    const userToken = res.data.data.default_auth_token
    loginEnterSuccess(userToken, postData.channel, () => {
      loading.close()
    })
  } catch (err) {
    loading.close()
    if (err.response.status === 403) {
      Notification.error(t('该手机号未获邀请，无法登录。'))
    } else {
      Notification.error(t('登录失败，请核对您填写的信息。'))
    }
  }
}
// ----------

watch(
  loginWay,
  (v) => {
    if (v === ELoginWay.loginMobile) {
      if ($notnull(loginQRCodeRes.value)) {
        pollingQREmpowerStatus()
      } else {
        handleRefreshQR()
      }
    } else {
      clearInterval(timer.value)
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.login-tip {
  &::after {
    display: inline-block;
    content: '';
    position: absolute;
    right: -18px;
    top: 50%;
    border-left: 9px solid #f2f3f5;
    border-top: 9px solid transparent;
    border-bottom: 9px solid transparent;
    border-right: 9px solid transparent;
    transform: translateY(-50%);
    opacity: 1;
  }
}
</style>
