<template>
  <MobileForm mobileLabel="手机号码" codeLabel="验证码" @handleSubmit="handleSubmitLogin" />
</template>

<script lang="ts" setup>
import { postLoginAPI } from '@/api/auth'
import { ElLoading, ElNotification as Notification } from 'element-plus'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MobileForm from './MobileForm.vue'

const emit = defineEmits(['loginEnterSuccess'])

const { t } = useI18n()
const refInputMobile = ref(null)

const handleSubmitLogin = async (postData: any) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('登录中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    const res = await postLoginAPI(postData)
    const userToken = res.data.data.default_auth_token
    emit('loginEnterSuccess', userToken, postData.channel, () => {
      loading.close()
    })
  } catch (err) {
    loading.close()
    if (err.response.status === 403) {
      Notification.error(t('该手机号未获邀请，无法登录。'))
      refInputMobile.value.focus()
    } else {
      Notification.error(t('登录失败，请核对您填写的信息。'))
    }
  }
}
</script>
