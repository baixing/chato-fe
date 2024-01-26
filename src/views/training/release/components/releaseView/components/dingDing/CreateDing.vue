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
import { getCommonGraph, postCommonGraph } from '@/api/graph'
import { postDingDingConfig } from '@/api/release'
import Modal from '@/components/Modal/index.vue'
import { EAfficialAccountStatusType, EChannelType } from '@/enum/release'
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
    } = await getCommonGraph<any>('mp_account', {
      filter: `type_def=="${EChannelType.DINGDING}" and domain_slug=="${props.domainSlug}"`
    })
    // getChannelType(EChannelType.DINGDING, props.domainSlug)
    if ($notnull(data)) {
      turn.value = data[0].s_status === EAfficialAccountStatusType.normal
      dingdingConfig.value = data[0]
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
    const res = await getCommonGraph<any>('mp_account', {
      filter: `domain_slug=="${props.domainSlug}" and type_def=="${EChannelType.DINGDING}" and s_status=="${EAfficialAccountStatusType.normal}"`
    })
    const account = res.data.data
    if ($notnull(account)) {
      await postCommonGraph('mp_account/save', {
        id: account[0].id,
        s_status: data.s_status,
        app_secret: dingdingConfig.value.app_secret,
        app_id: dingdingConfig.value.app_id
      })
    }

    // patchChannelType(EChannelType.DINGDING, props.domainSlug, data)
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
