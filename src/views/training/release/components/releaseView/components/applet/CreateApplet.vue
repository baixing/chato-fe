<template>
  <Modal width="40%" mbile-width="95%" v-model:visible="visible" title="配置小程序" :footer="false">
    <component
      :is="appletComponet[currentEmpowerStatus]"
      @handleEmpower="handleEmpower"
      @handleView="handleView"
    />
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Empower from './components/Empower.vue'
import EmpowerResult from './components/EmpowerResult.vue'
import { EAppletcStatus } from '@/enum/release'
import { postMiniAppAuthUrlAPI } from '@/api/release'
import { ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  value: boolean
  domainId: number | string
  defaultAppletcStatus: EAppletcStatus
}>()
const emit = defineEmits(['update:value', 'handleView'])

const { t } = useI18n()
const visible = computed({
  set: (val) => emit('update:value', val),
  get: () => props.value
})
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
  visible.value = false
  emit('handleView')
}

watch(
  () => props.defaultAppletcStatus,
  (v) => {
    currentEmpowerStatus.value = v || EAppletcStatus.empower
  },
  { immediate: true }
)

watch(visible, (v) => {
  !v && (currentEmpowerStatus.value = EAppletcStatus.empower)
})
</script>

<style scoped></style>
