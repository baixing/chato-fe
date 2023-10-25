<template>
  <div class="w-full h-full overflow-hidden bg-white flex justify-center items-center">
    <div>
      <LoginHeader />
      <div
        class="p-3 md:p-0 mt-14 m-auto border border-solid border-[#E4E7ED] md:border-none rounded-lg"
      >
        <BindingMobile
          v-if="isbindingMobile || externalUserId"
          :userId="userId"
          @loginEnterSuccess="loginEnterSuccess"
        />
        <template v-else>
          <div class="flex justify-end items-center">
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
          <div class="px-8 md:px-0 pb-3 w-[360px] md:w-full">
            <component
              :is="loginComponent[loginWay]"
              :timeout="timeout"
              :url="url"
              @loginEnterSuccess="loginEnterSuccess"
              @handleRefresh="handleRefreshQR"
              :loading="loading"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoginHeader from './components/LoginHeader.vue'
import LoginMobile from './components/LoginMobile.vue'
import LoginWeixin from './components/LoginWeixin.vue'
import BindingMobile from './components/BindingMobile.vue'
import { ELoginWay, ELoginEmpowerStatus } from '@/enum/auth'
import { LoginWayConfig } from '@/constant/auth'
import { useIsMobile } from '@/composables/useBasicLayout'
import { getLoginQRCodeAPI, getLoginQREmpowerStatusAPI } from '@/api/auth'
import type { ILoginQRCodeResult, ILoginQRCodeEmpowerResult } from '@/interface/auth'
import { $notnull } from '@/utils/help'
import useInvite from '@/composables/useInvite'
import { addSpaceMember } from '@/api/space'
import { useStorage } from '@vueuse/core'
import { useBase } from '@/stores/base'
import useGlobalProperties from '@/composables/useGlobalProperties'
import useChannel from '@/composables/useChannel'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

const { t } = useI18n()
const stateToken = useStorage('auth_token', '')
const externalUserId = useStorage('userId', '')
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
    : externalUserId.value
})
const url = computed(() => {
  return $notnull(loginQRCodeRes.value) ? loginQRCodeRes.value.url : ''
})
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
  router.replace('/manager/center')
  setShareChannel(channel)
  close && close()
}
// ----------

watch(
  loginWay,
  (v) => {
    if (v === ELoginWay.loginMobile && !userId.value) {
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
