<template>
  <div class="w-full h-full overflow-hidden bg-white flex justify-center items-center">
    <div>
      <header>
        <img src="@/assets/img/logo-header.png" alt="" class="logo" />
      </header>
      <div class="intro">
        <p>{{ $t('基于 AI 技术轻松创建对话机器人') }}</p>
      </div>

      <div class="form">
        <el-form
          ref="refForm"
          :rules="ruleForm"
          :model="modelForm"
          label-width="0"
          label-position="top"
        >
          <el-form-item :label="$t(`手机号码`)" prop="mobile">
            <el-input
              class="input-mobile"
              v-model.number="modelForm.mobile"
              type="text"
              size="large"
              :placeholder="$t(`手机号`)"
              autocomplete="off"
              ref="refInputMobile"
            >
            </el-input>
          </el-form-item>
          <el-form-item
            class="form-item-code"
            :label="$t(`验证码`)"
            prop="code"
            style="margin-bottom: 15px"
          >
            <el-input
              class="input-sms-code"
              v-model.trim="modelForm.code"
              type="text"
              size="large"
              :placeholder="$t(`验证码`)"
              autocomplete="off"
              maxlength="4"
              ref="refInputCode"
              @input="onCodeInputRBI"
            >
            </el-input>

            <el-button
              class="btn-send"
              size="large"
              @click="sendSmsCode"
              :disabled="isBtnSendDisabled"
              ref="refBtnSend"
              data-script="Chato-verification"
            >
              {{ codetText }}
            </el-button>
          </el-form-item>
          <el-form-item v-if="!shareChannel" :label="$t(`来源（选填）`)" prop="channelType">
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
                v-if="isinputChannel"
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
          <div
            style="
              font-size: 12px;
              color: #707070;
              display: flex;
              align-items: center;
              margin-bottom: 15px;
            "
          >
            <el-checkbox
              v-model="isBtnSubmitEnabled"
              label=""
              size="small"
              style="margin-right: 4px"
            />{{ $t('同意')
            }}<a
              style="color: #7c5cfc; margin-left: 5px; margin-right: 5px"
              @click.prevent="() => openPreviewUrl(kPrivacyLinkUrl)"
              >{{ $t('隐私政策') }}</a
            >{{ $t('和')
            }}<a
              style="color: #7c5cfc; margin-left: 5px"
              @click.prevent="() => openPreviewUrl(kUserAgreementLinkUrl)"
              >{{ $t('服务条款') }}</a
            >{{ $t('，未注册的手机号将自动创建账号') }}
          </div>
          <el-form-item>
            <el-button
              data-script="Chato-loginOrReg"
              class="btn-login"
              type="primary"
              size="large"
              @click="submitForm(refForm)"
              :disabled="!isBtnSubmitEnabled"
              >{{ $t('登录/注册') }}</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import * as apiAuth from '@/api/auth'
import { checkChannel } from '@/api/auth'
import { addSpaceMember } from '@/api/space'
import useBaiduPromotion from '@/composables/useBaiduPromotion'
import useChannel from '@/composables/useChannel'
import useGlobalProperties from '@/composables/useGlobalProperties'
import useInvite from '@/composables/useInvite'
import { kPrivacyLinkUrl, kUserAgreementLinkUrl } from '@/constant/terms'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { openPreviewUrl } from '@/utils/help'
import { validateCode, validateMobile } from '@/utils/validate'
import { useStorage } from '@vueuse/core'
import {
  ElLoading,
  ElNotification as Notification,
  dayjs,
  type FormInstance,
  type FormRules
} from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
const { t } = useI18n()

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

const inputChannel = [t('邀请码'), t('其他')]

const router = useRouter()
const route = useRoute()
const redir = route.query.redirect || '/'
const stateToken = useStorage('auth_token', '')
const { shareChannel, setShareChannel } = useChannel()
const { baiduPromotionId, baiduPromotionKeyword } = useBaiduPromotion()
const { invite_ticket } = useInvite()
const isBtnSendDisabled = ref(false)
const isBtnSubmitEnabled = ref(true)
const codetText = ref(t('获取验证码'))
const modelForm = reactive({
  mobile: '',
  code: '',
  channelType: '',
  channel: ''
})
const refForm = ref<FormInstance>(null)
const refInputCode = ref(null)
const refInputMobile = ref(null)
const refBtnSend = ref(null)
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
const isinputChannel = computed(() => inputChannel.includes(modelForm.channelType))

function validateChannelType(rule: any, value: any, callback: any) {
  if (modelForm.channelType === t('邀请码') && value !== '') {
    checkChannel({ code: value })
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

const baseStoreI = useBase()
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)

// 一进此页就检查
const isLoggedIn = computed(() => !!authToken.value)
if (isLoggedIn.value) {
  router.replace(redir as string)
}

function validatorMobile(rule, value, callback) {
  if (!validateMobile(value)) {
    callback(new Error(t('请输入正确的手机号')))
  } else {
    callback()
  }
}

function validatorCode(rule, value, callback) {
  if (!validateCode(value)) {
    callback(new Error(t('请输入正确的验证码')))
  } else {
    callback()
  }
}

let smsCodeTrackerTag = false

const { $sensors } = useGlobalProperties()
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
const onCodeInputRBI = () => {
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

async function sendSmsCode() {
  if (!validateMobile(modelForm.mobile)) {
    // TODO 实现完整的表单校验
    Notification.error(t('您填写的手机号有误，请检查。'))
    refBtnSend.value.ref.blur()
    return
  }
  isBtnSendDisabled.value = true
  const mobile = modelForm.mobile
  refInputCode.value.focus()
  apiAuth
    .sendSmsCode(mobile)
    .then(() => {
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
    })
    .catch((err) => {
      if (err.response.status === 403) {
        Notification.error(t('该手机号未获邀请，无法登录。'))
        refInputMobile.value.focus()
      } else {
        Notification.error(t('短信验证码发送失败，请稍后重试。'))
      }
      isBtnSendDisabled.value = false
      refInputCode.value.blur()
    })
}

// 空间
const enterSpaceValidate = async (invite_ticket: string) => {
  try {
    const res = await addSpaceMember({ invite_ticket })
    const addSpaceRes = res.data
    stateToken.value = addSpaceRes.data.token
  } catch (e) {}
}

async function submitForm(refForm) {
  if (!refForm) return
  await refForm.validate((valid) => {
    if (valid) {
      const channelVal =
        shareChannel.value || (isinputChannel.value ? modelForm.channel : modelForm.channelType)
      const postData = {
        mobile: modelForm.mobile,
        verification_code: modelForm.code,
        bd_vid: baiduPromotionId.value,
        bd_keyword: baiduPromotionKeyword.value,
        channel:
          shareChannel.value || (isinputChannel.value ? modelForm.channel : modelForm.channelType)
      }
      const loading = ElLoading.service({
        lock: true,
        text: t('登录中...'),
        background: 'rgba(0, 0, 0, 0.7)'
      })
      apiAuth
        .login(postData)
        .then(async (res) => {
          const userToken = res.data.data
          stateToken.value = userToken.default_auth_token
          authToken.value = userToken.default_auth_token
          setShareChannel(channelVal)
          if (postData.channel === 'invite' && invite_ticket.value) {
            await enterSpaceValidate(invite_ticket.value as string)
          }
          const userInfo = await baseStoreI.getUserInfo()
          userInfo?.id && $sensors?.login(userInfo?.id.toString())
          router.replace(`/manager/center`)
        })
        .catch((err) => {
          if (err.response.status === 403) {
            Notification.error(t('该手机号未获邀请，无法登录。'))
            refInputMobile.value.focus()
          } else {
            Notification.error(t('登录失败，请核对您填写的信息。'))
          }
        })
        .finally(() => {
          loading.close()
        })
    } else {
      Notification.error(t('抱歉，您填写的信息有误'))
      refBtnSend.value.ref.blur()
    }
  })
}
</script>
<style lang="scss" scoped>
header {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  .logo {
    margin-left: 10px;
    margin-right: 10px;
    width: 194px;
    height: 40px;
  }

  h1 {
    margin-left: 10px;
    margin-right: 10px;
    font-size: 84px;
  }
}

.intro {
  margin-top: 16px;
  line-height: 1.5;
  text-align: center;
  font-size: 18px;
  color: #3d3d3d;
}

.user-tip {
  margin-top: 10px;
  text-align: center;
  font-size: $fs-s;
  color: #aaa;
}

.form {
  margin: auto;
  margin-top: 80px;
  width: 360px;

  input {
    text-align: center;
  }

  :deep(.el-form-item) {
    margin-bottom: 28px;
  }

  .form-item-code :deep(.el-form-item__content) {
    justify-content: space-between;
  }

  .input-sms-code {
    width: 220px;
  }

  .btn-send {
    width: 120px;
  }

  .btn-login {
    margin-top: 10px;
    width: 100%;
  }
}
</style>
