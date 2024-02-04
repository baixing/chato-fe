<template>
  <Modal
    width="40%"
    mobile-width="95%"
    v-model:visible="visible"
    :title="$t(createStatus === EAccountSettingStatus.creating ? '创建账号' : '重启账号')"
    :footer="false"
  >
    <component
      :is="accountComponent[currentStatus]"
      :loading="loading"
      :accountQrCode="accountQrCode"
      :createStatus="createStatus"
      :isCode="isCode"
      @handleSubmit="handleSubmit"
      @handleCreateChat="handleCreateChat"
      @handleClose="visible = false"
      @handleSubmitCode="handleSubmitCode"
    />
  </Modal>
</template>

<script setup lang="ts">
import {
  createGroupVerificationCodeAPI,
  getAccountBindingStatus,
  getAccountQrCode
} from '@/api/release'
import { EAccountCreateStatus, EAccountSettingStatus } from '@/enum/release'
import type { ICreateAccountRes } from '@/interface/release'
import { useDomainStore } from '@/stores/domain'
import { $notnull } from '@/utils/help'
import { ElLoading, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CreateAccountFailed from './components/CreateAccountFailed.vue'
import CreateAccountForm from './components/CreateAccountForm.vue'
import CreateAccountSuccess from './components/CreateAccountSuccess.vue'

const props = defineProps<{
  value: boolean
  orgId: number
  defaultAccountQrCode: ICreateAccountRes
  createStatus: EAccountSettingStatus
}>()
const emit = defineEmits(['update:value', 'UpdateCreateChatVisible'])

const { t } = useI18n()
const useDomain = useDomainStore()
const { domainInfo } = storeToRefs(useDomain)
const currentStatus = ref<EAccountCreateStatus>(EAccountCreateStatus.create)
const accountQrCode = ref<ICreateAccountRes>()
const loading = ref<boolean>(false)
const isCode = ref<boolean>(false)
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
const accountComponent = computed(() => ({
  [EAccountCreateStatus.create]: CreateAccountForm,
  [EAccountCreateStatus.success]: CreateAccountSuccess,
  [EAccountCreateStatus.failed]: CreateAccountFailed
}))

const serachEmpowerStatus = async (key: string) => {
  const params = {
    qr_code_key: key,
    default_domain_slug: domainInfo.value.slug
  }
  const { data } = await getAccountBindingStatus(params)
  if (data.data.is_online) {
    currentStatus.value = EAccountCreateStatus.success
    isCode.value = false
    accountQrCode.value = null
  }
  return data
}

const handleSubmit = async (key: string) => {
  const res = await serachEmpowerStatus(key)
  if (!res.data.is_online) {
    return Notification.warning(res.message)
  } else {
    currentStatus.value = EAccountCreateStatus.success
  }
}

const handleCreateChat = () => {
  visible.value = false
  emit('UpdateCreateChatVisible')
}

const pollingEmpowerStatus = () => {
  let timer = setInterval(async () => {
    if (!props.value) return clearInterval(timer)
    const res = await serachEmpowerStatus(accountQrCode.value.qr_code_key)

    if (res.data.is_online) {
      currentStatus.value = EAccountCreateStatus.success
      isCode.value = false
      accountQrCode.value = null
      clearInterval(timer)
      return
    }

    if (res.data.is_expired) {
      clearInterval(timer)
      return
    }

    if (res.data.is_used) {
      return Notification.error(t('您的账号已经托管过，不能重复托管'))
    }

    if (res.data.login_status === 10) {
      return (isCode.value = true)
    }
  }, 2000)
}

const handleSubmitCode = async (code: string) => {
  const loading = ElLoading.service({
    lock: true,
    text: t('校验中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    const data = {
      qr_code_key: accountQrCode.value.qr_code_key,
      client_id: accountQrCode.value.client_id,
      code
    }
    await createGroupVerificationCodeAPI(data)
    Notification.success('校验成功')
  } catch (error) {
  } finally {
    loading.close()
  }
}

const init = async () => {
  try {
    loading.value = true
    currentStatus.value = EAccountCreateStatus.create
    let response = await getAccountQrCode()
    let qrCodeData = response.data.data

    // 如果第一次获取的数据中没有 qr_code，再尝试一次
    if (!qrCodeData.qr_code) {
      response = await getAccountQrCode()
      qrCodeData = response.data.data
    }

    // 设置响应式变量的值
    accountQrCode.value = qrCodeData || null // 如果 qrCodeData.qr_code 不存在，则设置为 null

    // 调用轮询授权状态的函数
    qrCodeData.qr_code && pollingEmpowerStatus()
  } catch (e) {
    visible.value = false
    // currentStatus.value = EAccountCreateStatus.failed
  } finally {
    loading.value = false
  }
}

watch(props, (v) => {
  if ($notnull(v.defaultAccountQrCode)) {
    currentStatus.value = EAccountCreateStatus.create
    accountQrCode.value = v.defaultAccountQrCode
    pollingEmpowerStatus()
  } else if (v.value) {
    init()
  }
})
</script>

<style lang="scss">
.create-account-title {
  @apply text-[#303133] mb-[12px] font-medium text-sm;
}
</style>
