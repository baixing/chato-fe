<template>
  <Modal
    mobile-width="100%"
    v-model:visible="internalVisible"
    :footer="false"
    class="public-img-container"
  >
    <div v-if="codeImgLoading" class="flex flex-col justify-center items-center">
      <div class="w-[40px] h-[40px] mb-[12px]" v-loading="codeImgLoading"></div>
      <p class="text-[#7C5CFC] mb-[16px] text-sm font-medium" @click="emit('handleShowDrawer')">
        {{ $t('生成中') }}
      </p>
      <p class="text-[#596780] mb-[12px]">
        {{ $t('生成群二维码，需等待约1分钟左右') }}
      </p>
      <p class="text-[#9DA3AF]">
        {{ $t('可关闭窗口，稍后前往 ') }}<span class="text-[#7C5CFC]">{{ $t('「查看群聊」') }}</span
        >{{ $t(' 中查看二维码') }}
      </p>
    </div>
    <div v-else class="preview-code-container">
      <p class="text-[#7C5CFC] mb-[12px]">
        <el-icon size="24"><SuccessFilled /></el-icon>
      </p>
      <p class="text-[#7C5CFC] mb-[16px] text-sm font-medium">
        {{ $t('已生成') }}
      </p>
      <p class="text-[#9DA3AF]">
        {{ $t('可前往')
        }}<span class="text-[#7C5CFC]" @click="emit('handleShowDrawer')">{{
          $t('「查看群聊」')
        }}</span
        >{{ $t('中查看二维码') }}
      </p>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import { computed } from 'vue'

const emit = defineEmits(['update:value', 'handleShowDrawer'])

const props = defineProps<{
  value: boolean
  codeImgLoading: boolean
}>()

const internalVisible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})
</script>
<style lang="scss">
.public-img-container {
  text-align: center;
  cursor: pointer;
  .el-dialog__header {
    margin-right: 0;
  }
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 24px;
  }
}
</style>
