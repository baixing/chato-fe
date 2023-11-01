<template>
  <div class="text-center text-[#3D3D3D] p-8">
    <p class="mb-6 text-[28px] font-medium">{{ $t('欢迎加入，请绑定手机号') }}</p>
    <p class="mb-12 text-sm">{{ $t('为了您的账户安全请绑定手机号，后续可直接扫码登录') }}</p>
    <div class="w-[360px]">
      <MobileForm :requiredChannel="false" :isbindingMobile="true" v-slot="slotProps">
        <div class="text-[#707070] flex items-center mb-2 text-xs mt-5">
          <el-checkbox
            v-model="isBtnSubmitEnabled"
            label=""
            size="small"
            style="margin-right: 4px"
          />
          {{ $t('同意') }}
          <a class="theme-color mx-1" @click.prevent="() => openPreviewUrl(kPrivacyLinkUrl)">
            {{ $t('隐私政策') }}
          </a>
          {{ $t('和') }}
          <a class="theme-color ml-1" @click.prevent="() => openPreviewUrl(kUserAgreementLinkUrl)">
            {{ $t('服务条款') }}
          </a>
          <span>，</span>
          {{ $t('未注册的手机号将自动创建账号') }}
        </div>
        <el-row class="w-full" justify="space-between">
          <el-col :span="10">
            <el-button
              size="large"
              data-script="Chato-NotbindingMobile"
              @click="emit('handleRescanCode')"
            >
              {{ $t('重新扫码') }}
            </el-button>
          </el-col>
          <el-col :span="12" :offset="2">
            <el-button
              type="primary"
              size="large"
              data-script="Chato-bingingMobile"
              :disabled="!isBtnSubmitEnabled"
              @click="
                submitForm(
                  slotProps.refBtnSend,
                  slotProps.ref,
                  slotProps.modelForm,
                  slotProps.isInputChannel
                )
              "
            >
              {{ $t('绑定') }}
            </el-button>
          </el-col>
        </el-row>
      </MobileForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileForm from './MobileForm.vue'
import type { ILoginMobile, ILoginParams } from '@/interface/auth'
import { ElNotification as Notification, ElLoading, type FormInstance } from 'element-plus'
import { postBindingMobileAPI } from '@/api/auth'
import { useI18n } from 'vue-i18n'
import useRSA from '@/composables/useRSA'
import useBaiduPromotion from '@/composables/useBaiduPromotion'
import useChannel from '@/composables/useChannel'
import { ref } from 'vue'
import { openPreviewUrl } from '@/utils/help'
import { kPrivacyLinkUrl, kUserAgreementLinkUrl } from '@/constant/terms'

const props = defineProps<{
  userId: string
}>()
const emit = defineEmits(['loginEnterSuccess', 'handleRescanCode'])

const { t } = useI18n()
const { encryption } = useRSA()
const { shareChannel } = useChannel()
const { baiduPromotionId, baiduPromotionKeyword } = useBaiduPromotion()
const isBtnSubmitEnabled = ref(true)

const handleSubmitBinding = async (data: ILoginParams) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('绑定中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const postData = {
      ...data,
      external_user_id: Number(props.userId)
    }
    const res = await postBindingMobileAPI(postData)
    const userToken = res.data.data.default_auth_token
    emit('loginEnterSuccess', userToken, postData.channel)
  } catch (error) {
  } finally {
    loading.close()
  }
}

const submitForm = (
  refBtnSend,
  refForm: FormInstance,
  modelForm: ILoginMobile,
  isInputChannel: boolean
) => {
  if (!refForm) return
  refForm.validate(async (valid) => {
    if (valid) {
      const postData = {
        mobile: encryption(modelForm.mobile) as string,
        verification_code: modelForm.code,
        bd_vid: baiduPromotionId.value,
        bd_keyword: baiduPromotionKeyword.value,
        channel: shareChannel.value || (isInputChannel ? modelForm.channel : modelForm.channelType)
      }
      handleSubmitBinding(postData)
    } else {
      Notification.error(t('抱歉，您填写的信息有误'))
      refBtnSend.ref.blur()
    }
  })
}
</script>

<style scoped></style>
