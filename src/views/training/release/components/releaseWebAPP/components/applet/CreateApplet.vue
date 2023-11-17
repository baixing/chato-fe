<template>
  <component
    :is="appletComponet[currentEmpowerStatus]"
    @handleEmpower="handleEmpower"
    @handleView="handleView"
  />
</template>

<script setup lang="ts">
import { postMiniAppAuthUrlAPI } from '@/api/release'
import { EAppletcStatus } from '@/enum/release'
import { ElMessageBox } from 'element-plus'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Empower from './components/Empower.vue'
import EmpowerResult from './components/EmpowerResult.vue'

const props = defineProps<{
  visible: boolean
  domainId: number | string
  defaultAppletcStatus: EAppletcStatus
}>()
const emit = defineEmits(['update:value', 'handleView'])

const { t } = useI18n()
const currentEmpowerStatus = ref(EAppletcStatus.empower)
const appletComponet = {
  [EAppletcStatus.empower]: Empower,
  [EAppletcStatus.empowerSuccess]: EmpowerResult
}
const redirectURL = `${window.location.origin}${window.location.pathname}?releaseChannel=applet`

const handleEmpower = async () => {
  ElMessageBox.confirm(t('确认清空小程序，并覆盖为机器人对话页面？'), t('确认授权'), {
    confirmButtonText: t('确认'),
    cancelButtonText: t('取消')
  })
    .then(async () => {
      const data = {
        redirect_uri: redirectURL,
        domain_id: props.domainId
      }
      const res = await postMiniAppAuthUrlAPI(data)
      window.open(res.data.data)
    })
    .catch(() => {})
}

const handleView = () => {
  emit('handleView')
}

watch(
  () => props.defaultAppletcStatus,
  (v) => {
    currentEmpowerStatus.value = v || EAppletcStatus.empower
  },
  { immediate: true }
)

watch(
  () => props.visible,
  (v) => {
    !v && (currentEmpowerStatus.value = EAppletcStatus.empower)
  }
)
</script>

<style scoped></style>
