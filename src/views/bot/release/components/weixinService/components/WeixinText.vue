<template>
  <div>
    <slot name="top"></slot>
    <p
      class="flex justify-between items-center text-[#596780] mb-[12px] p-container"
      v-for="(value, key) in configList"
      :key="key"
    >
      <label :for="value" class="leading-5">{{ $t(EWeixinConfigText[key]) }}：{{ value }}</label>
      <el-button link type="primary" @click="emit('handleCopy', value)">{{ $t('复制') }}</el-button>
    </p>
    <slot name="bottom"></slot>
  </div>
</template>
<script lang="ts" setup>
import { EWeixinConfigText } from '@/constant/release'
import type { weixinConfigListRes } from '@/interface/release'
import { computed } from 'vue'

const props = defineProps<{
  list: Partial<weixinConfigListRes>
  index?: number
}>()
const emit = defineEmits(['handleCopy'])
const targetOrder = ['url', 'token', 'encoding_aes_key', 'app_secret']

const configList = computed({
  get: () => {
    const result = {}
    const cList = [...targetOrder, props.index !== 2 ? 'app_id' : '']
    cList.forEach((key) => {
      // eslint-disable-next-line no-prototype-builtins
      if (props.list[key]) {
        result[key] = props.list[key]
      }
    })
    return result
  },
  set: (val) => val
})
</script>
<style lang="scss" scoped>
.p-container {
  &:last-of-type {
    margin-bottom: 16px;
  }
}
</style>
