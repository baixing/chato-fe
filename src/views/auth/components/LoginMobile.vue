<template>
  <MobileForm
    v-slot="slotProps"
    :requiredChannel="requiredChannel"
    mobileLabel="手机号码"
    codeLabel="验证码"
  >
    <p
      v-if="isInvite"
      class="w-full text-center text-[#B5BED0] flex justify-center items-center mb-2 text-xs mt-5 cursor-pointer"
    >
      {{ $t('登录即表示默认同意') }}
      <a class="mx-1" @click.prevent="() => openPreviewUrl(kPrivacyLinkUrl)">
        {{ $t('隐私政策') }}
      </a>
      {{ $t('和') }}
      <a class="ml-1" @click.prevent="() => openPreviewUrl(kUserAgreementLinkUrl)">
        {{ $t('服务条款') }}
      </a>
    </p>
    <div v-else class="text-[#707070] flex items-center mb-2 text-xs mt-5">
      <el-checkbox v-model="isBtnSubmitEnabled" label="" size="small" style="margin-right: 4px" />
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
    <el-button
      data-script="Chato-loginOrReg"
      :class="['w-full', isInvite && '!bg-[#303133] !rounded-full !text-white !border-none']"
      type="primary"
      size="large"
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
      {{ $t(submitBtnText) }}
    </el-button>
  </MobileForm>
</template>

<script lang="ts" setup>
import { ElNotification as Notification, type FormInstance } from 'element-plus'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MobileForm from './MobileForm.vue'
import type { ILoginMobile } from '@/interface/auth'
import useRSA from '@/composables/useRSA'
import useChannel from '@/composables/useChannel'
import useBaiduPromotion from '@/composables/useBaiduPromotion'
import { openPreviewUrl } from '@/utils/help'
import { kPrivacyLinkUrl, kUserAgreementLinkUrl } from '@/constant/terms'

const emit = defineEmits(['loginEnterSuccess', 'handleSubmitLogin'])
withDefaults(
  defineProps<{
    requiredChannel: boolean
    submitBtnText: string
    isInvite: boolean
  }>(),
  {
    requiredChannel: true,
    submitBtnText: '登录/注册',
    isInvite: false
  }
)

const { t } = useI18n()
const { encryption } = useRSA()
const { shareChannel } = useChannel()
const { baiduPromotionId, baiduPromotionKeyword } = useBaiduPromotion()
const isBtnSubmitEnabled = ref(true)

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
      emit('handleSubmitLogin', postData)
    } else {
      Notification.error(t('抱歉，您填写的信息有误'))
      refBtnSend.ref.blur()
    }
  })
}
</script>
