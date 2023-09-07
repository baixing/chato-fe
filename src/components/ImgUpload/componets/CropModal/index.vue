<template>
  <UploadModal
    :width="isMobile ? '100%' : '50%'"
    :title="$t(`裁剪图片（移动方框可裁剪图片最佳位置）`)"
    :visible="cropVisible"
    :modal="true"
    :footer="false"
    @onCancel="() => emit('handleCropClose')"
  >
    <Crop
      :cropProps="cropProps"
      :url="cropUrl"
      @handleCropSuccess="(uid, url) => emit('handleCropSuccess', uid, url)"
    />
  </UploadModal>
</template>

<script setup lang="ts">
import { useBasicLayout } from '@/composables/useBasicLayout'
import UploadModal from '../UploadModal.vue'
import Crop, { type CropProps } from './crop/index.vue'

interface Props {
  cropVisible: boolean
  cropProps: CropProps
  cropUrl: string | undefined // 需要裁剪的url
}

interface EmitProps {
  (e: 'handleCropSuccess', uid: string, previewUrl: string): void
  (e: 'handleCropClose'): void
  (e: 'update:cropVisible', v: boolean)
}

defineProps<Props>()
const emit = defineEmits<EmitProps>()

const { isMobile } = useBasicLayout()
</script>
