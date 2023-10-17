<template>
  <div class="form">
    <el-form
      ref="refForm"
      :rules="ruleForm"
      :model="modelForm"
      label-width="0"
      :label-position="labelPosition"
    >
      <el-form-item :label="$t(mobileLabel)" prop="mobile">
        <el-input
          class="input-mobile"
          v-model.trim="modelForm.mobile"
          type="text"
          size="large"
          :placeholder="$t(`手机号`)"
          autocomplete="off"
          ref="refInputMobile"
        />
      </el-form-item>
      <el-form-item
        class="form-item-code"
        :label="$t(codeLabel)"
        prop="code"
        style="margin-bottom: 15px"
      >
        <el-input
          class="!w-[220px] md:!w-[60%]"
          v-model.trim="modelForm.code"
          type="text"
          size="large"
          :placeholder="$t(`验证码`)"
          autocomplete="off"
          maxlength="4"
          ref="refInputCode"
          @input="onCodeInputRBI"
        />
        <el-button
          class="!w-[120px] md:!w-[30%]"
          size="large"
          @click="sendSmsCode(refForm)"
          :disabled="isBtnSendDisabled"
          ref="refBtnSend"
          data-script="Chato-verification"
        >
          {{ codetText }}
        </el-button>
      </el-form-item>
      <p class="text-right text-[#9DA3AF] text-xs cursor-pointer" @click="codeTipVisible = true">
        {{ $t('收不到验证码？') }}
      </p>
      <el-form-item
        v-if="!shareChannel && !isbindingMobile"
        :label="$t(`来源（选填）`)"
        prop="channelType"
      >
        <el-select
          v-model="modelForm.channelType"
          class="w-full"
          size="large"
          :placeholder="$t(`来源`)"
          autocomplete="off"
        >
          <el-option
            v-for="item in ChannelOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-form-item prop="channel" class="w-full">
          <el-input
            v-if="isInputChannel"
            class="mt-3"
            v-model.trim="modelForm.channel"
            type="text"
            size="large"
            :placeholder="$t(`其他来源的详细描述或邀请码`)"
            autocomplete="off"
            maxlength="30"
          />
        </el-form-item>
      </el-form-item>
      <div class="text-[#707070] flex items-center mb-2 text-xs mt-5">
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
      <el-form-item class="!mb-0">
        <el-row class="w-full" justify="space-between" v-if="isbindingMobile">
          <el-col :span="10">
            <el-button
              size="large"
              data-script="Chato-NotbindingMobile"
              @click="emit('handleClose')"
            >
              {{ $t('下次再说') }}
            </el-button>
          </el-col>
          <el-col :span="12" :offset="2">
            <el-button
              type="primary"
              size="large"
              data-script="Chato-bingingMobile"
              :disabled="!isBtnSubmitEnabled"
              @click="submitForm(refForm)"
            >
              {{ $t('绑定') }}
            </el-button>
          </el-col>
        </el-row>
        <el-button
          v-else
          data-script="Chato-loginOrReg"
          class="w-full"
          type="primary"
          size="large"
          :disabled="!isBtnSubmitEnabled"
          @click="submitForm(refForm)"
        >
          {{ $t('登录/注册') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
  <Modal
    width="40%"
    mobile-width="95%"
    v-model:visible="codeTipVisible"
    title="收不到短信验证码"
    :footer="false"
  >
    <p v-for="item in LoginCodeTip" :key="item" class="text-xs mb-3 text-left text-[#596780]">
      {{ $t(item) }}
    </p>
    <p class="flex items-center text-sm my-4 text-left text-[#596780]">
      {{ $t('若以上原因都无法解决，可通过人工方式获取验证码，详情咨询') }}
      <el-button link type="primary" size="large" @click="onContactUs">
        {{ $t('产品顾问') }}
      </el-button>
    </p>
    <el-row class="w-full" justify="end">
      <el-col :xl="4" :lg="4" :md="12" :sm="12" :xs="12">
        <el-button type="primary" size="large" @click="codeTipVisible = false">
          {{ $t('返回') }}
        </el-button>
      </el-col>
    </el-row>
  </Modal>
  <UpgradeRightsModal />
</template>

<script lang="ts" setup>
import { postSendSmsCodeAPI, getCheckChannelAPI } from '@/api/auth'
import useBaiduPromotion from '@/composables/useBaiduPromotion'
import useChannel from '@/composables/useChannel'
import useGlobalProperties from '@/composables/useGlobalProperties'
import { kPrivacyLinkUrl, kUserAgreementLinkUrl } from '@/constant/terms'
import { openPreviewUrl } from '@/utils/help'
import { validateCode, validateMobile } from '@/utils/validate'
import {
  ElNotification as Notification,
  dayjs,
  type FormInstance,
  type FormRules
} from 'element-plus'
import { computed, reactive, ref, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import useRSA from '@/composables/useRSA'
import { LoginCodeTip } from '@/constant/auth'
import { ESpaceRightsType } from '@/enum/space'
import useSpaceRights from '@/composables/useSpaceRights'

const UpgradeRightsModal = defineAsyncComponent(
  () => import('@/components/Upgrade/UpgradeRightsModal.vue')
)

withDefaults(
  defineProps<{
    labelPosition: 'top' | 'right' | 'left'
    mobileLabel: string
    codeLabel: string
    isbindingMobile: boolean
  }>(),
  {
    labelPosition: 'top',
    mobileLabel: '',
    codeLabel: '',
    isbindingMobile: false
  }
)
const emit = defineEmits(['handleSubmit', 'handleClose'])

const { checkRightsTypeNeedUpgrade } = useSpaceRights()
const { encryption } = useRSA()
const { t } = useI18n()
const { shareChannel, setShareChannel } = useChannel()
const { baiduPromotionId, baiduPromotionKeyword } = useBaiduPromotion()
const { $sensors } = useGlobalProperties()
const isBtnSendDisabled = ref(false)
const isBtnSubmitEnabled = ref(true)
const codetText = ref(t('获取验证码'))
const refForm = ref<FormInstance>(null)
const refInputCode = ref(null)
const refInputMobile = ref(null)
const refBtnSend = ref(null)
const codeTipVisible = ref(false)

let smsCodeTrackerTag = false
const inputChannel = [t('邀请码'), t('其他')]
const ChannelOptions = [
  { label: t('朋友推荐'), value: t('朋友推荐') },
  { label: t('抖音'), value: t('抖音') },
  { label: t('小红书'), value: t('小红书') },
  { label: t('微信视频号'), value: t('微信视频号') },
  { label: t('微信公众号'), value: t('微信公众号') },
  { label: t('微信群'), value: t('微信群') },
  { label: t('搜索引擎'), value: t('搜索引擎') },
  { label: t('邀请码'), value: t('邀请码') },
  { label: t('其他'), value: t('其他') }
]
const modelForm = reactive({
  mobile: '',
  code: '',
  channelType: '',
  channel: ''
})
const ruleForm = reactive<FormRules>({
  mobile: [
    { required: true, message: t('请输入手机号'), trigger: 'blur' },
    { validator: validatorMobile, trigger: 'blur' }
  ],
  code: [
    { required: true, message: t('请输入验证码'), trigger: 'blur' },
    { validator: validatorCode, trigger: 'blur' }
  ],
  channel: [{ required: false, validator: validateChannelType, trigger: 'blur' }]
})
const isInputChannel = computed(() => inputChannel.includes(modelForm.channelType))

function validateChannelType(rule: any, value: any, callback: any) {
  if (modelForm.channelType === t('邀请码') && value !== '') {
    getCheckChannelAPI({ code: value })
      .then((res) => {
        const { data } = res.data
        !data && Notification.error(t('邀请码无效'))
        callback()
      })
      .catch(() => {})
  } else {
    callback()
  }
}

function validatorMobile(rule: any, value: any, callback: any) {
  if (!validateMobile(value)) {
    callback(new Error(t('请输入正确的手机号')))
  } else {
    callback()
  }
}

function validatorCode(rule: any, value: any, callback: any) {
  if (!validateCode(value)) {
    callback(new Error(t('请输入正确的验证码')))
  } else {
    callback()
  }
}

const onContactUs = () => {
  checkRightsTypeNeedUpgrade(ESpaceRightsType.default)
}

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

// 验证码输入业务打点
const onCodeInputRBI = async () => {
  if (smsCodeTrackerTag || codetText.value === t('获取验证码')) {
    return
  }

  $sensors?.track('sms_code_input_time', {
    name: t('短信验证码输入时间'),
    type: 'sms_code_input_time',
    data: {
      mobile: modelForm.mobile,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })

  smsCodeTrackerTag = true
}

// 发送验证码
const sendSmsCode = (refForm: FormInstance) => {
  if (!refForm) return
  refForm.validateField('mobile', async (message) => {
    if (!message) {
      return refBtnSend.value.ref.blur()
    }
    isBtnSendDisabled.value = true
    const encryptMobile = encryption(modelForm.mobile)
    refInputCode.value.focus()
    try {
      await postSendSmsCodeAPI(encryptMobile as string)
      Notification.success(t('短信验证码已发出，请查收。'))
      onCodeSendRBI()
      let count = 60
      let timer = setInterval(() => {
        count--
        codetText.value = count + 's'
        if (count < 0) {
          codetText.value = t('获取验证码')
          smsCodeTrackerTag = false
          clearInterval(timer)
          isBtnSendDisabled.value = false
        }
      }, 1000)
    } catch (error) {
      isBtnSendDisabled.value = false
      refInputCode.value.blur()
    }
  })
}

// 登录
const submitForm = (refForm: FormInstance) => {
  if (!refForm) return
  refForm.validate(async (valid) => {
    if (valid) {
      const postData = {
        mobile: encryption(modelForm.mobile),
        verification_code: modelForm.code,
        bd_vid: baiduPromotionId.value,
        bd_keyword: baiduPromotionKeyword.value,
        channel:
          shareChannel.value || (isInputChannel.value ? modelForm.channel : modelForm.channelType)
      }
      emit('handleSubmit', postData)
    } else {
      Notification.error(t('抱歉，您填写的信息有误'))
      refBtnSend.value.ref.blur()
    }
  })
}
</script>

<style scoped lang="scss">
.form {
  input {
    text-align: center;
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
}
</style>
