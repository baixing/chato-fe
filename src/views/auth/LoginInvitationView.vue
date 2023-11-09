<template>
  <div
    v-loading="loading"
    class="box-border overflow-hidden h-full w-full bg-white flex flex-col justify-center items-center md:px-6"
  >
    <div class="flex flex-col justify-center items-center text-center">
      <p class="mb-16 text-[36px] text-[#596780] font-medium md:text-[30px] md:mb-[74px]">
        {{ $t('Hi，邀请你和我对话') }}
      </p>
      <div
        class="box-border w-[360px] md:w-full relative rounded-lg px-3 pb-4 pt-[50px] mb-10"
        style="border: 1px solid #e4e7ed"
      >
        <!-- <img
          :src="robotDetail.avatar || avatar"
          class="absolute top-0 left-[50%] translate-y-[-50%] translate-x-[-50%] w-[79px] h-[79px] rounded-full z-[999]"
        /> -->
        <Avatar
          :avatar="robotDetail.avatar || avatar"
          :size="79"
          :name="robotDetail.name.slice(0, 2)"
          class="absolute top-0 left-[50%] translate-y-[-50%] translate-x-[-50%] w-[79px] h-[79px] rounded-full z-[999]"
        />
        <h1 class="mb-3">{{ robotDetail.name }}</h1>
        <p class="overflow-ellipsis md:line-clamp-3 text-[#878787] text-sm">
          {{ robotDetail.desc }}
        </p>
      </div>
      <div class="box-content px-8 md:px-0 pb-3 w-[360px] md:w-full">
        <LoginMobile
          :requiredChannel="false"
          submitBtnText="开始对话"
          :isInvite="true"
          @handleSubmitLogin="handleSubmitLogin"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { postCheckLoginCAPI, postLoginCAPI } from '@/api/auth'
import { getDomainDetailPublic } from '@/api/domain'
import avatar from '@/assets/img/avatar.png'
import useGlobalProperties from '@/composables/useGlobalProperties'
import type { IDomainInfo } from '@/interface/domain'
import { RoutesMap } from '@/router'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'
import { ElLoading, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import LoginMobile from './components/LoginMobile.vue'

const { t } = useI18n()
const { $sensors } = useGlobalProperties()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { uid } = storeToRefs(authStore)
const loading = ref(true)
const robotDetail = ref<Partial<IDomainInfo>>({})

const botSlug = computed(() => (route.query.slug as string) || '')

// ----- C端登录 -------

const loginEnterSuccess = async (token: string, channel: string, close?: () => void) => {
  authStore.setUid(token)
  const res = await postCheckLoginCAPI(botSlug.value, uid.value)
  if (!res.data.data.login || !res.data.data.usable) {
    Notification.info(t('该手机号没有被邀请'))
  } else {
    Notification.success(t('登录成功'))
    router.replace({
      name: RoutesMap.chat.release,
      params: {
        botSlug: botSlug.value
      }
    })
  }

  $sensors?.track('c_login_success', {
    name: t('C端登录'),
    type: 'c_login_success',
    data: {
      id: token,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })
  close && close()
}

const handleSubmitLogin = async (postData: any) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('登录中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    const res = await postLoginCAPI(postData)
    const userToken = res.data.data.uuid
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
// --------------------

//  获取机器人信息
const getBotInfo = async () => {
  loading.value = true
  const res = await getDomainDetailPublic(botSlug.value)
  robotDetail.value = res.data.data
  loading.value = false
}

getBotInfo()
</script>

<style scoped lang="scss">
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
