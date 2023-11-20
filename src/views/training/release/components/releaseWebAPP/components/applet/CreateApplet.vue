<template>
  <Modal
    width="45%"
    mobile-width="100%"
    v-model:visible="visible"
    :title="$t(`覆盖已有小程序`)"
    :footer="false"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane :label="$t(`授权`)" name="empower">
        <component
          :is="appletComponet[currentEmpowerStatus]"
          @handleEmpower="handleEmpower"
          @handleView="handleView"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t(`已授权`)" name="authorized">
        <DrawerApplet
          @handleRetry="activeName = 'empower'"
          :domainId="domainId"
          :value="activeName === 'authorized'"
        />
      </el-tab-pane>
    </el-tabs>
  </Modal>
</template>

<script setup lang="ts">
import { postMiniAppAuthUrlAPI } from '@/api/release'
import { EAppletcStatus } from '@/enum/release'
import { ElMessageBox } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DrawerApplet from './components/DrawerApplet.vue'
import Empower from './components/Empower.vue'
import EmpowerResult from './components/EmpowerResult.vue'

const props = defineProps<{
  value: boolean
  domainId: number | string
  defaultAppletcStatus: EAppletcStatus
}>()
const emit = defineEmits(['update:value', 'handleView'])

const activeName = ref('empower')
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})

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
  () => props.value,
  (v) => {
    !v && (currentEmpowerStatus.value = EAppletcStatus.empower)
  }
)
</script>

<style scoped></style>
