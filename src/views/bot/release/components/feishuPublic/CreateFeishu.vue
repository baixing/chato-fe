<template>
  <Modal
    width="45%"
    mobile-width="95%"
    v-model:visible="visible"
    :title="t('配置飞书群聊')"
    :footer="false"
    class="official-account-container"
    @cancel="visible = false"
  >
    <div v-loading="loading">
      <CreatePublic
        @handleSubmit="handleSubmit"
        @handleClose="handleClose"
        :feishuConfig="feishuConfig"
        v-if="!feishuConfig.url || resetConfig"
      />
      <Configpublic
        v-else
        v-model:ban="ban"
        :url="feishuConfig.url"
        @handleResetConfig="resetConfig = true"
      />
    </div>
  </Modal>
</template>
<script lang="ts" setup>
import { getFeishuConfig, postFeishuConfig, postSwitchFeishuConfig } from '@/api/release'
import Modal from '@/components/Modal/index.vue'
import type { feishuiPublicFormType } from '@/interface/release'
import { $notnull } from '@/utils/help'
import { ElLoading } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Configpublic from './components/ConfigPublic.vue'
import CreatePublic from './components/CreatePublic.vue'
const { t } = useI18n()
const emit = defineEmits(['update:value'])
const props = defineProps<{
  value: boolean
  slug: string
}>()

const loading = ref(false)
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})

const resetConfig = ref(false)
const feishuConfig = ref<feishuiPublicFormType>({
  app_id: '',
  app_secret: '',
  encrypt_key: '',
  verification_token: '',
  url: ''
})
const ban = ref(false)

// 提交飞书
const handleSubmit = async (e: feishuiPublicFormType) => {
  const postData = {
    domain_slug: props.slug,
    app_id: e.app_id,
    app_secret: e.app_secret,
    encrypt_key: e.encrypt_key,
    verification_token: e.verification_token
  }
  const loading = ElLoading.service({
    lock: true,
    text: t('提交中..'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    const {
      data: { data }
    } = await postFeishuConfig(postData)
    feishuConfig.value.url = data.url
    resetConfig.value = false
  } catch (e) {
    resetConfig.value = true
  } finally {
    loading.close()
  }
}

// 获取飞书配置
const initFeishuConfig = async () => {
  try {
    loading.value = true
    const {
      data: { data }
    } = await getFeishuConfig(props.slug)
    if ($notnull(data.info)) {
      ban.value = !data.ban
      feishuConfig.value = data.info
    }
  } catch (e) {
  } finally {
    loading.value = false
  }
}

// 开启或关闭飞书群聊
const updateFeishuStatus = async () => {
  if (!feishuConfig.value.app_id) return
  const data = {
    domain_slug: props.slug,
    app_id: feishuConfig.value.app_id,
    ban: !ban.value
  }
  try {
    await postSwitchFeishuConfig(data)
  } catch (e) {}
}

const handleClose = () => {
  visible.value = false
  resetConfig.value = false
}

watch(
  () => props.value,
  (v) => {
    if (v && !feishuConfig.value.url) {
      loading.value = true
      initFeishuConfig()
    } else {
      resetConfig.value = false
    }
  },
  { immediate: true }
)

watch(ban, () => {
  updateFeishuStatus()
})
</script>
<style lang="scss" scoped>
.official-account-container {
  .el-dialog__header {
    margin-right: 0;
  }
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 24px;
  }
}
</style>
