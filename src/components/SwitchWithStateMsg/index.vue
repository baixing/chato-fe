<template>
  <span :class="['gap-3 flex items-center', msgPosition === 'right' && 'flex-row-reverse']">
    <span
      :class="[
        'text-[#AAAAAA] text-xs shrink-0 font-normal',
        internalVal && '!text-inherit !text-[#7C5CFC]'
      ]"
    >
      {{ internalVal ? $t(props.openMsg) : $t(props.closeMsg) }}
    </span>
    <el-switch v-model="internalVal" :size="size" />
  </span>
</template>

<script setup lang="ts">
import type { SwitchProps } from 'element-plus'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: boolean | number
    openMsg?: string
    closeMsg?: string
    size?: SwitchProps['size']
    msgPosition?: 'left' | 'right'
  }>(),
  {
    size: 'small',
    openMsg: '展示',
    closeMsg: '不展示',
    msgPosition: 'right'
  }
)

const emit = defineEmits(['update:value', 'change'])

const internalVal = computed({
  get: () => (typeof props.value === 'number' ? Boolean(props.value) : props.value),
  set: (val) => {
    emit('change', val)
    emit('update:value', val)
  }
})
</script>
