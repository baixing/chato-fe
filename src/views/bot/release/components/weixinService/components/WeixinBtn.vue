<template>
  <el-row justify="end" class="w-full" :gutter="12">
    <el-col :lg="6" :xl="6" :md="12" :xs="12" :sm="12">
      <el-button size="large" @click="emit('handleCancle')">{{ $t(cancelText) }}</el-button>
    </el-col>
    <el-col :lg="6" :xl="6" :md="12" :xs="12" :sm="12"
      ><el-button
        :disabled="Boolean(disabled)"
        @click="emit('handleBtn')"
        size="large"
        type="primary"
        >{{ btnText }}</el-button
      ></el-col
    >
  </el-row>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
withDefaults(
  defineProps<{
    btnText: string
    cancelText?: string
    disabled?: boolean
  }>(),
  {
    cancelText: '取消',
    btnText: '确认',
    disabled: false
  }
)
const emit = defineEmits(['handleCancle', 'handleBtn'])
</script>
