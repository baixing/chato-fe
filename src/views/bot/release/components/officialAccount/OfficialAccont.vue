<template>
  <Modal
    width="45%"
    mobile-width="100%"
    v-model:visible="internalVisible"
    :title="$t(`配置公众号`)"
    :footer="false"
    class="official-account-container"
  >
    <el-tabs v-model="activeName" class="official-tabs">
      <el-tab-pane :label="$t(`添加菜单`)" name="addMenuTab"
        ><AddMenuTab
          @handleEventSet="handleEventSet"
          :link="link + '?source=mp_menu'"
          :qrcode="qrcode"
      /></el-tab-pane>
      <el-tab-pane :label="$t(`自动回复`)" name="automaticTab" :qrcode="qrcode"
        ><AutomaticTab
          @handleEventSet="handleEventSet"
          :qrcode="qrcode"
          :link="link + '?source=mp_reply'"
      /></el-tab-pane>
      <el-tab-pane :label="$t(`消息调用`)" name="MessageTab"
        ><MessageTab
          @handleCloseDialog="emit('update:value', false)"
          @handleEventSet="handleEventSet"
          :slug_id="slug_id"
      /></el-tab-pane>
    </el-tabs>
    <SketchDialog v-model:value="sketchDialogVisible" :url="previewUrl" />
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { computed, ref } from 'vue'
import SketchDialog from '../SketchDialog.vue'
import AddMenuTab from './components/AddMenuTab.vue'
import AutomaticTab from './components/AutomaticTab.vue'
import MessageTab from './components/MessageTab.vue'

type handleEventSetType = 'preview' | 'copy'

const emit = defineEmits(['update:value', 'handleCopyLink'])
const props = defineProps<{
  value: boolean
  link: string
  slug_id: string
}>()
const qrcode = useQRCode(props.link, {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  quality: 1,
  margin: 3,
  scale: 8, // 8px per modules(black dots)
  color: {
    dark: '#000', // 像素点颜色
    light: '#FFF' // 背景色
  }
})
const activeName = ref('addMenuTab')
const sketchDialogVisible = ref<boolean>(false)
const previewUrl = ref<string>('')

const internalVisible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})

const handleEventSet = (type: handleEventSetType, value?: string) => {
  switch (type) {
    case 'preview':
      sketchDialogVisible.value = true
      previewUrl.value = value
      break
    case 'copy':
      emit('handleCopyLink', value)
      break
    default:
      break
  }
}
</script>
<style lang="scss">
.official-account-container {
  .el-dialog__header {
    margin-right: 0;
  }
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 24px;
  }
}

.steps-container {
  .el-step__icon {
    background: #b5bed0;
    color: #fff;
    border: 2px solid #b5bed0;
  }
  .el-step__line {
    background: #b5bed0;
  }
}
</style>
