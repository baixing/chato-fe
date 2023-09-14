<template>
  <el-button
    plain
    type="primary"
    size="default"
    :disabled="!internalRole || generating || !internalGenerateStr.length"
    style="
      --el-button-hover-text-color: #7c5cfc;
      --el-button-hover-bg-color: white;
      --el-color-primary-light-9: white;
    "
    @click="onAIGenerate"
  >
    {{ btnText }}
  </el-button>
</template>

<script setup lang="ts">
import type { EDomainAIGenerateType } from '@/enum/domain'
import SSE from '@/utils/sse'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps<{
  generateStr: string
  type: EDomainAIGenerateType
  role: string
}>()

const emit = defineEmits(['update:generateStr', 'start', 'end'])

const internalGenerateStr = computed({
  get: () => props.generateStr || '',
  set: (v) => emit('update:generateStr', v)
})

const internalRole = computed(() => props.role)

const clickCount = ref(0)
const generating = ref(false)
const btnText = computed(() => (clickCount.value ? t('换一个') : t('一键 AI 优化')))

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
