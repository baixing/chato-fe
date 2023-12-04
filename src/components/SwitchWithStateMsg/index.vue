<template>
  <span
    :class="[
      'gap-3 inline-flex items-center text-[#AAAAAA] shrink-0 font-normal',
      size === 'small' && 'text-xs',
      size === 'default' && 'text-sm',
      size === 'large' && 'text-base',
      msgPosition === 'right' && 'flex-row-reverse'
    ]"
  >
    <span :class="[internalVal && '!text-[#7C5CFC]']">
      {{ internalVal ? $t(props.openMsg) : $t(props.closeMsg) }}
    </span>
    <el-switch v-model="internalVal" :size="size" :active-value="1" :inactive-value="0" />
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
    isShow?: boolean
  }>(),
  {
    size: 'small',
    openMsg: '展示',
    closeMsg: '不展示',
    msgPosition: 'left'
  }
)

const emit = defineEmits(['update:value', 'change'])

const internalVal = computed({
  get: () => Number(props.value),
  set: (val) => {
    emit('change', val, props.isShow)
    emit('update:value', val)
  }
})
</script>
