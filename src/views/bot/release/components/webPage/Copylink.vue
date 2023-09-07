<template>
  <Modal
    width="35%"
    mobile-width="100%"
    v-model:visible="internalVisible"
    :title="$t(`复制链接`)"
    :footer="false"
    class="copy-link-container"
  >
    <header>{{ $t('URL链接') }}</header>
    <p class="text-[color: #596780] text-sm my-[18px] flex items-center">
      {{ chatWebPage }}
      <el-button class="ml-1" type="primary" link size="large" @click="emit('handleCopyLink')">{{
        $t('复制')
      }}</el-button>
    </p>
    <header>{{ $t('二维码') }}</header>
    <div class="qr-container">
      <QrCode :value="chatWebPage" :bordered="false" errorLevel="M" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import { computed } from 'vue'
import QrCode from './QrCode.vue'

const props = defineProps<{
  value: boolean
  chatWebPage: string
}>()

const emit = defineEmits(['update:value', 'handleCopyLink'])

const internalVisible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})
</script>
<style lang="scss" scoped>
header {
  color: #303133;
  font-size: 14px;
  line-height: 24px;
}
.qr-container {
  margin-left: -9px;
}
</style>
<style lang="scss">
.copy-link-container {
  .el-dialog__header {
    margin-right: 0;
  }
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 24px;
  }
}
</style>
