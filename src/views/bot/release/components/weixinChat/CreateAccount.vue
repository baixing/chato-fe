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
      @handleSubmit="handleSubmit"
      @handleCreateChat="handleCreateChat"
      @handleClose="visible = false"
    />
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CreateAccountForm from './components/CreateAccountForm.vue'
import CreateAccountFailed from './components/CreateAccountFailed.vue'
import CreateAccountSuccess from './components/CreateAccountSuccess.vue'
import { EAccountCreateStatus, EQrCodeHookType, EAccountSettingStatus } from '@/enum/release'
import { getAccountQrCode, getAccountBindingStatus } from '@/api/release'
import type { ICreateAccountRes } from '@/interface/release'
import { ElNotification as Notification } from 'element-plus'
import { $notnull } from '@/utils/help'

const props = defineProps<{
  value: boolean
  orgId: number
  defaultAccountQrCode: ICreateAccountRes
  createStatus: EAccountSettingStatus
}>()
const emit = defineEmits(['update:value', 'UpdateCreateChatVisible'])

const currentStatus = ref<EAccountCreateStatus>(EAccountCreateStatus.create)
const accountQrCode = ref<ICreateAccountRes>()
const loading = ref<boolean>(false)
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
    hook_type: EQrCodeHookType.wxwork,
    qr_code_key: key,
    is_restart: false,
    wx_user_id: ''
  }
  if (props.createStatus === EAccountSettingStatus.restart) {
    params.is_restart = true
    params.wx_user_id = props.defaultAccountQrCode.wx_user_id
  }
  const { data } = await getAccountBindingStatus(props.orgId, params)
  if (data.data.is_online) {
    currentStatus.value = EAccountCreateStatus.success
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
    const res = await serachEmpowerStatus(accountQrCode.value.qrCodeKey)
    if (res.data.is_expired) {
      init()
      clearInterval(timer)
    }
    if (res.data.is_online) {
      currentStatus.value = EAccountCreateStatus.success
      accountQrCode.value = null
      clearInterval(timer)
    }
  }, 2000)
}

const init = async () => {
  try {
    loading.value = true
    currentStatus.value = EAccountCreateStatus.create
    const res = await getAccountQrCode(EQrCodeHookType.wxwork)
    accountQrCode.value = res.data.data
    pollingEmpowerStatus()
  } catch (e) {
    currentStatus.value = EAccountCreateStatus.failed
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
