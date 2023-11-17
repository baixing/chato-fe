<template>
  <Modal
    v-model:visible="internalVisible"
    title="AI 一键生成"
    :footer-attrs="{ submitId: 'Chato_tranning_create_domain_by_ai', submitText: 'AI 一键生成' }"
    @submit="onSubmit"
  >
    <el-form
      ref="formRef"
      :model="formState"
      label-position="top"
      :rules="formRules"
      class="bot-create-form"
    >
      <el-form-item :label="t('角色名字')" prop="role" required>
        <HansInputLimit
          v-model:value="formState.role"
          type="text"
          size="large"
          :placeholder="t(`例如：营销助手、客服专员等`)"
          :limit="20"
          class="w-full"
        />
      </el-form-item>
      <el-form-item :label="t('角色需求')">
        <HansInputLimit
          v-model:value="formState.role_requirement"
          type="textarea"
          size="large"
          :placeholder="t('例如：制定专业的苹果手机营销计划和策略')"
          :rows="4"
          :limit="300"
          class="w-full"
        />
      </el-form-item>
    </el-form>
  </Modal>
</template>
<script lang="ts" setup>
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import Modal from '@/components/Modal/index.vue'
import { EDomainAIGenerateType } from '@/enum/domain'
import SSE from '@/utils/sse'
import type { FormInstance, FormRules } from 'element-plus'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
}>()
const emit = defineEmits(['update:visible', 'updateDomainField', 'submit', 'done'])

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const { t } = useI18n()

const defaultFormState = {
  role: '',
  role_requirement: ''
}

let formState = reactive({ ...defaultFormState })
const formRef = ref<FormInstance>()
const formRules = reactive<FormRules>({
  role: [{ required: true, message: t('角色名字不能为空'), trigger: 'change' }]
})

const SSEInstance = new SSE()
let SSEPromptRes = ''

const onSSE = (type: EDomainAIGenerateType, prompt?: string) => {
  return SSEInstance.request(
    '/prompt/generated',
    {
      role: formState.role,
      role_requirement: formState.role_requirement,
      system_prompt: prompt,
      generate_type: type
    },
    (str) => {
      switch (type) {
        case EDomainAIGenerateType.intro:
          emit('updateDomainField', 'desc', str)
          break
        case EDomainAIGenerateType.role:
          SSEPromptRes += str
          emit('updateDomainField', 'system_prompt', str)
          break
        case EDomainAIGenerateType.welcome:
          emit('updateDomainField', 'welcome', str)
          break
      }
    }
  )
}

const onSubmit = async () => {
  try {
    await formRef.value.validate()
    SSEPromptRes = ''
    emit('submit', formState.role, formState.role_requirement)
    await onSSE(EDomainAIGenerateType.role)
    // const allPromises = [EDomainAIGenerateType.intro, EDomainAIGenerateType.welcome].map((item) =>
    //   onSSE(item, SSEPromptRes)
    // )
    // await Promise.all(allPromises)
  } catch (e) {
  } finally {
    emit('done')
  }
}

watch(internalVisible, (v) => {
  if (!v) {
    return
  }
  Object.assign(formState, defaultFormState)
  nextTick(() => {
    formRef.value?.clearValidate()
  })
})
</script>
<style lang="scss" scoped>
.bot-create-form {
  :deep(.el-form-item__label) {
    @apply text-[#303133] text-sm leading-4 font-medium tracking-[0.13px] mb-4;
  }
}
</style>
