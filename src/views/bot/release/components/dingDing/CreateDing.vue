<template>
  <Modal
    width="45%"
    mobile-width="95%"
    v-model:visible="visible"
    :title="$t('配置钉钉')"
    :footer="false"
    @cancel="() => emit('update:value', false)"
  >
    <div v-loading="loading">
      <CreateForm
        @handleSubmit="handleSubmit"
        @handleClose="handleClose"
        :dingdingConfig="dingdingConfig"
        v-if="!dingdingConfig.url || resetConfig"
      />
      <ConfigDetail
        v-else
        v-model:turn="turn"
        :url="dingdingConfig.url"
        @handleResetConfig="resetConfig = true"
      />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { getChannelType, postDingDingConfig, patchChannelType } from '@/api/release'
import { EAfficialAccountStatusType, EChannelType } from '@/enum/release'
import Modal from '@/components/Modal/index.vue'
import type { IDingDingPublicFormType } from '@/interface/release'
import { $notnull } from '@/utils/help'
import { ElLoading } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ConfigDetail from './components/ConfigDetail.vue'
import CreateForm from './components/CreateForm.vue'

const { t } = useI18n()
const emit = defineEmits(['update:value'])
const props = defineProps<{
  value: boolean
  domainSlug: string
}>()

const loading = ref(false)
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})

const resetConfig = ref(false)
const dingdingConfig = ref<IDingDingPublicFormType>({
  app_id: '',
  app_secret: '',
  url: ''
})
const turn = ref(true)

const handleSubmit = async (e: IDingDingPublicFormType) => {
  const postData = {
    app_id: e.app_id,
    app_secret: e.app_secret,
    s_status: EAfficialAccountStatusType.normal
  }
  const loading = ElLoading.service({
    lock: true,
    text: t('提交中..'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    const {
      data: { data }
    } = await postDingDingConfig(postData, props.domainSlug)
    dingdingConfig.value.url = data.url
    turn.value = data.s_status === EAfficialAccountStatusType.normal
  } catch (e) {
  } finally {
    loading.close()
    resetConfig.value = false
  }
}

const initdingdingConfig = async () => {
  try {
    loading.value = true
    const {
      data: { data }
    } = await getChannelType(EChannelType.DINGDING, props.domainSlug)
    if ($notnull(data)) {
      turn.value = data.s_status === EAfficialAccountStatusType.normal
      dingdingConfig.value = data
    }
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const updateFeishuStatus = async () => {
  if (!dingdingConfig.value.app_id) return
  const data = {
    app_id: dingdingConfig.value.app_id,
    app_secret: dingdingConfig.value.app_secret,
    s_status: turn.value ? EAfficialAccountStatusType.normal : EAfficialAccountStatusType.disabled
  }
  try {
    await patchChannelType(EChannelType.DINGDING, props.domainSlug, data)
  } catch (e) {}
}

const handleClose = () => {
  visible.value = false
  resetConfig.value = false
}

watch(
  () => props.value,
  (v) => {
    if (v && !dingdingConfig.value.url) {
      loading.value = true
      initdingdingConfig()
    } else {
      resetConfig.value = false
    }
  },
  { immediate: true }
)

watch(turn, () => {
  updateFeishuStatus()
})
</script>
