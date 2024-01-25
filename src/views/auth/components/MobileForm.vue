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
        <div class="flex items-center justify-between gap-2 w-full">
          <el-input
            class="input-mobile"
            v-model.trim="modelForm.mobile"
            type="text"
            size="large"
            :placeholder="$t(`手机号`)"
            autocomplete="off"
            ref="refInputMobile"
            @keyup.enter="sendSmsCode(refForm)"
          >
          </el-input>
          <el-button
            type="primary"
            @click="sendSmsCode(refForm)"
            :disabled="isBtnSendDisabled"
            ref="refBtnSend"
            size="large"
            data-script="Chato-verification"
          >
            {{ codetText }}
          </el-button>
        </div>
      </el-form-item>
      <transition name="fade">
        <el-form-item
          v-show="true"
          class="form-item-code"
          :label="$t(codeLabel)"
          prop="code"
          style="margin-bottom: 15px"
        >
          <el-input
            id="smsInput"
            v-model.trim="modelForm.code"
            type="text"
            size="large"
            :placeholder="$t(`验证码`)"
            autocomplete="off"
            maxlength="4"
            ref="refInputCode"
            @input="onCodeInputRBI"
          />
        </el-form-item>
      </transition>
      <transition name="fade">
        <p
          v-show="true"
          class="text-right text-[#9DA3AF] text-xs cursor-pointer"
          @click="codeTipVisible = true"
        >
          {{ $t('收不到验证码？') }}
        </p>
      </transition>
      <el-form-item class="!mb-0">
        <slot
          :ref="refForm"
          :modelForm="modelForm"
          :refBtnSend="refBtnSend"
          :isInputChannel="isInputChannel"
          :sendSmsCode="sendSmsCode"
        />
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
import { postSendSmsCodeAPI } from '@/api/auth'
import { getCommonGraph } from '@/api/graph'
import useGlobalProperties from '@/composables/useGlobalProperties'
import useRSA from '@/composables/useRSA'
import useSpaceRights from '@/composables/useSpaceRights'
import { LoginCodeTip } from '@/constant/auth'
import { ESpaceRightsType } from '@/enum/space'
import { $notnull } from '@/utils/help'
import { validateCode, validateMobile } from '@/utils/validate'
import {
  ElNotification as Notification,
  dayjs,
  type FormInstance,
  type FormRules
} from 'element-plus'
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const UpgradeRightsModal = defineAsyncComponent(
  () => import('@/components/Upgrade/UpgradeRightsModal.vue')
)

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

const { checkRightsTypeNeedUpgrade } = useSpaceRights()
const { encryption } = useRSA()
const { t } = useI18n()
const { $sensors } = useGlobalProperties()
const isBtnSendDisabled = ref(false)
const codetText = ref(t('获取验证码'))
const refForm = ref<FormInstance>(null)
const refInputCode = ref(null)
const refInputMobile = ref(null)
const refBtnSend = ref(null)
const codeTipVisible = ref(false)
// const showSmsCodeInput = ref(!isMobile)

let smsCodeTrackerTag = false
const inputChannel = [t('邀请码'), t('其他')]
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
    getCommonGraph<any[]>('inviter_channels', {
      filter: 'code=="${value}"'
    })
      .then((res) => {
        const { data } = res.data
        !$notnull(data) || dayjs().isAfter(dayjs(data[0].expired))
          ? Notification.error(t('邀请码无效'))
          : Notification.success('有效邀请码')
        callback()
      })
      .catch((err) => {
        console.log(err)
      })

    // getCheckChannelAPI({ code: value })
    //   .then((res) => {
    //     const { data } = res.data
    //     !data && Notification.error(t('邀请码无效'))
    //     callback()
    //   })
    //   .catch(() => {})
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
      focusSmsInput()
    } catch (error) {
      isBtnSendDisabled.value = false
      refInputCode.value.blur()
    }
  })
}

function focusSmsInput() {
  refInputCode.value.focus()
}

onMounted(() => {
  setTimeout(() => {
    refInputMobile.value.focus()
  }, 300)
})
</script>

<style scoped lang="scss">
.form {
  input {
    text-align: center;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  .form-item-code :deep(.el-form-item__content) {
    justify-content: space-between;
  }

  :deep(.el-form-item__label) {
    color: #303133;
    margin-bottom: 1px;
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
