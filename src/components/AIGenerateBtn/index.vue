<template>
  <el-tooltip :disabled="!disabled || generating || !disabledTip" placement="left-start">
    <template #content>
      {{ t(disabledTip) }}
    </template>
    <el-button
      type="primary"
      plain
      :disabled="disabled || generating"
      size="default"
      @click="onAIGenerate"
    >
      {{ btnText }}
    </el-button>
  </el-tooltip>
</template>

<script setup lang="ts">
import type { EDomainAIGenerateType } from '@/enum/domain'
import SSE from '@/utils/sse'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps<{
  generateStr: string
  systemPrompt: string
  type: EDomainAIGenerateType
  role: string
  roleRequirement?: string
  disabled?: boolean
  disabledTip?: string
  link?: boolean
}>()

const emit = defineEmits(['update:generateStr', 'start', 'end'])

const internalGenerateStr = computed({
  get: () => props.generateStr || '',
  set: (v) => emit('update:generateStr', v)
})

const internalRole = computed(() => props.role)
const internalRoleRequirement = computed(() => props.roleRequirement)
const internalSystemPrompt = computed(() => props.systemPrompt)

const clickCount = ref(0)
const generating = ref(false)
const btnText = computed(() => (clickCount.value ? t('换一个') : t('AI 一键生成')))

const SSEInstance = new SSE()

const onAIGenerate = async () => {
  generating.value = true
  emit('start')
  try {
    const promptStr = internalGenerateStr.value
    let resStr = ''
    internalGenerateStr.value = ''

    await SSEInstance.request(
      '/prompt/generated',
      {
        role: internalRole.value,
        role_requirement: internalRoleRequirement.value,
        system_prompt: internalSystemPrompt.value,
        user_prompt: promptStr,
        generate_type: props.type
      },
      (str) => {
        resStr += str
        internalGenerateStr.value = resStr
      }
    )

    clickCount.value++
  } catch (e) {
  } finally {
    generating.value = false
    emit('end')
  }
}

const onResetCount = () => (clickCount.value = 0)

defineExpose({
  resetCount: onResetCount
})
</script>
