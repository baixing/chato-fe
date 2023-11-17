<template>
  <div>
    <div v-show="!showSmsCodeInput">
      <header class="flex justify-center items-center">
        <img src="@/assets/img/chato-logo.png" class="w-[165px] h-[153px]" />
      </header>

      <div class="text-center text-[#303133] text-base">
        <p class="text-[16px] font-medium">
          {{ $t('完成手机号注册, 创建你的') }}
          <span class="text-[#7c5cfc]"> {{ $t('专属AI') }} </span>
        </p>
        <p class="mt-[20px] text-[13px] text-[#596780]">
          {{ $t('限时') }}
          <span class="text-[#7c5cfc] font-medium"> {{ $t('免费赠送') }} </span>
          100
          {{ $t('电力值') }}
        </p>
      </div>

      <div class="form mt-[114px]">
        <el-form ref="refForm" :model="modelForm" label-width="0" :label-position="labelPosition">
          <el-input
            v-show="!showSmsCodeInput"
            v-model.trim="modelForm.mobile"
            type="text"
            size="large"
            :placeholder="$t(`手机号`)"
            autocomplete="off"
            ref="refInputMobile"
            @keyup.enter="sendSmsCode(refForm)"
          >
            <template #prefix>
              <span class="text-black font-sans">+86 </span>
              <span class="pl-3 pb-1 font-thin text-xl text-start text-[#b5beb0]">|</span>
            </template>
          </el-input>

          <el-form-item class="mt-[10px] mb-0">
            <el-button
              class="w-full"
              type="primary"
              size="large"
              :disabled="!isBtnSubmitEnabled"
              @click="sendSmsCode(refForm)"
            >
              {{ $t('继续') }}
              <ArrowRight class="w-4 h-4 inline-block" />
            </el-button>
          </el-form-item>
          <div class="text-[#B5BEB0] flex items-center mb-2 text-xs mt-5">
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
            <a
              class="theme-color ml-1"
              @click.prevent="() => openPreviewUrl(kUserAgreementLinkUrl)"
            >
              {{ $t('服务条款') }}
            </a>
            <span>，</span>
            {{ $t('未注册的手机号将自动创建账号') }}
          </div>
        </el-form>
      </div>
    </div>
    <div v-show="showSmsCodeInput">
      <transition name="fade">
        <div>
          <div v-show="showSmsCodeInput" class="mt-0 font-medium text-lg text-center w-full mb-4">
            输入验证码
          </div>
          <VerificationInput
            v-if="isMobile"
            v-show="showSmsCodeInput"
            v-model="modelForm.code"
            :step="4"
            :autofocus="true"
            @change="
              (value) => {
                modelForm.code = value
                if (value.length === 4) {
                  submitForm(refForm)
                }
              }
            "
          >
          </VerificationInput>
          <el-button
            :disabled="isBtnSendDisabled"
            v-show="true"
            type="primary"
            size="small"
            class="text-xs mt-40 w-full text-center"
            link
            @click="sendSmsCode(refForm)"
          >
            {{ codetText }}
          </el-button>
          <div class="form">
            <el-button
              v-show="showSmsCodeInput"
              class="w-full mt-[28px]"
              type="primary"
              size="large"
              :disabled="!isBtnSubmitEnabled"
              @click="submitForm(refForm)"
            >
              {{ $t('进入') }}
              <ArrowRight class="w-4 h-4 inline-block" />
            </el-button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { postSendSmsCodeAPI } from '@/api/auth'
import useBaiduPromotion from '@/composables/useBaiduPromotion'
import { useIsMobile } from '@/composables/useBasicLayout'
import useByteDancePromotion from '@/composables/useByteDancePromotion'
import useChannel from '@/composables/useChannel'
import useGlobalProperties from '@/composables/useGlobalProperties'
import useRSA from '@/composables/useRSA'
import { kPrivacyLinkUrl, kUserAgreementLinkUrl } from '@/constant/terms'
import { openPreviewUrl } from '@/utils/help'
import { validateMobile } from '@/utils/validate'
import { ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElNotification as Notification, dayjs, type FormInstance } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    labelPosition: 'top' | 'right' | 'left'
    mobileLabel: string
    codeLabel: string
    isbindingMobile: boolean
    requiredChannel: boolean
  }>(),
  {
    labelPosition: 'top',
    mobileLabel: '',
    codeLabel: '',
    isbindingMobile: false,
    requiredChannel: true
  }
)

const { encryption } = useRSA()
const { t } = useI18n()

const { $sensors } = useGlobalProperties()
const isBtnSendDisabled = ref(true)
const codetText = ref(t('重新获取'))
const refForm = ref<FormInstance>(null)
const refInputMobile = ref(null)
const isMobile = useIsMobile()
const showSmsCodeInput = ref(!isMobile)
const isBtnSubmitEnabled = ref(true)

const modelForm = reactive({
  mobile: '',
  code: '',
  channelType: '',
  channel: ''
})

// 验证码发送业务打点
const onCodeSendRBI = () => {
  $sensors?.track('sms_code_send_time', {
    name: t('短信验证码发送时间'),
    type: 'sms_code_send_time',
    data: {
      mobile: modelForm.mobile,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })
}

// 发送验证码
const sendSmsCode = (refForm: FormInstance) => {
  if (!validateMobile(modelForm.mobile)) {
    ElMessage.error('请输入正确的手机号')
    return
  }
  if (!refForm) return
  refForm.validateField('mobile', async (message) => {
    if (!message) {
      return
    }
    isBtnSendDisabled.value = true
    const encryptMobile = encryption(modelForm.mobile)
    try {
      await postSendSmsCodeAPI(encryptMobile as string)
      Notification.success(t('短信验证码已发出，请查收。'))
      onCodeSendRBI()
      let count = 60
      let timer = setInterval(() => {
        count--
        codetText.value = '重新获取(' + count + 's)'
        if (count < 0) {
          codetText.value = t('重新获取')
          clearInterval(timer)
          isBtnSendDisabled.value = false
        }
      }, 1000)
      showSmsCodeInput.value = true
    } catch (error) {
      isBtnSendDisabled.value = false
    }
  })
}

const { baiduPromotionId, baiduPromotionKeyword } = useBaiduPromotion()
const { bytedancePromotionClickid } = useByteDancePromotion()
const { shareChannel } = useChannel()
const emit = defineEmits(['handleSubmitLogin'])
const submitForm = (refForm: FormInstance) => {
  if (modelForm.code.length != 4) {
    ElMessage.error('请输入正确的验证码')
    return
  }
  if (!refForm) return
  refForm.validate(async (valid) => {
    if (valid) {
      const postData = {
        mobile: encryption(modelForm.mobile) as string,
        verification_code: modelForm.code,
        bd_vid: baiduPromotionId.value,
        bd_keyword: baiduPromotionKeyword.value,
        dy_clickid: bytedancePromotionClickid.value,
        channel: shareChannel.value
      }
      emit('handleSubmitLogin', postData)
    } else {
      Notification.error(t('抱歉，您填写的信息有误'))
    }
  })
}

onMounted(() => {
  setTimeout(() => {
    refInputMobile.value?.focus()
  }, 300)
})
</script>

<style scoped lang="scss">
.form {
  input {
    text-align: center;
  }

  button {
    height: 55px;
    border-radius: 10px;
    font-weight: 500;
    font-size: 18px;
  }

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  .form-item-code :deep(.el-form-item__content) {
    justify-content: space-between;
  }

  :deep(.el-form-item__label) {
    color: #303133;
  }
  :deep(.el-input__wrapper) {
    color: #303133;
    border-radius: 10px;
    background-color: #f5f6f8;
    height: 55px;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.8s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
