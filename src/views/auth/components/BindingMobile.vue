<template>
  <div class="text-center text-[#3D3D3D] p-8">
    <p class="mb-6 text-[28px] font-medium">{{ $t('欢迎加入，请绑定手机号') }}</p>
    <p class="mb-12 text-sm">{{ $t('为了您的账户安全请绑定手机号，后续可直接扫码登录') }}</p>
    <div class="w-[360px]">
      <MobileForm
        :isbindingMobile="true"
        @handleSubmit="handleSubmitBinding"
        @handleClose="handleClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileForm from './MobileForm.vue'
import type { ILoginParams } from '@/interface/auth'
import { ElLoading } from 'element-plus'
import { postBindingMobileAPI } from '@/api/auth'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const props = defineProps<{
  userId: string
}>()
const emit = defineEmits(['loginEnterSuccess'])

const { t } = useI18n()
const router = useRouter()

const handleSubmitBinding = async (data: ILoginParams) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('绑定中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const postData = {
      ...data,
      external_user_id: props.userId
    }
    const res = await postBindingMobileAPI(postData)
    const userToken = res.data.data.default_auth_token
    emit('loginEnterSuccess', userToken, postData.channel)
  } catch (error) {
  } finally {
    loading.close()
  }
}

const handleClose = () => {
  router.replace('/')
}
</script>

<style scoped></style>
