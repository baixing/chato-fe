<template>
  <div class="crop-container">
    <div class="crop-content">
      <VueCropper
        ref="cropperRef"
        :img="url"
        :info="true"
        :infoTrue="false"
        :auto-crop="true"
        :fixed-box="false"
        :fixed="cropProps.autoAspectRatio"
        :centerBox="false"
        :fixedNumber="cropProps.aspectRatio"
        :full="false"
        :canScale="false"
        outputType="png"
        :canMove="true"
        mode="contain"
        @realTime="realTime"
      >
      </VueCropper>
    </div>

    <div class="crop-preview">
      <el-button
        type="primary"
        size="large"
        v-loading="submitLoading"
        :disabled="submitLoading"
        @click="() => handleConfirmCropper()"
        >确认裁剪</el-button
      >
    </div>
    <!-- <div class="crop-preview">
      <div class="title">图片预览</div>
      <div class="preview-box">
        <div class="preview-container" :style="div">
          <img
            class="img-preview"
            @load="handleReady"
            :style="imgLocation"
            :src="previewUrl"
            alt="预览图片"
          />
        </div>
      </div>
      <el-button
        type="primary"
        size="large"
        v-loading="submitLoading"
        :disabled="submitLoading"
        @click="() => handleConfirmCropper()"
        >确认裁剪</el-button
      >
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { uploadImage } from '@/api/file'
import { useDomainStore } from '@/stores/domain'
import { ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
// import VueCropper from 'vue-cropper/src/vue-cropper.vue'

export interface CropProps {
  aspectRatio: number[] // width/height
  autoAspectRatio?: boolean // 是否允许修改设定好的 aspectRatio 裁剪比例
}

interface Props {
  cropProps: CropProps
  url?: string
}

interface EmitProps {
  (e: 'handleCropSuccess', uid: string, previewUrl: string): void
}

defineProps<Props>()
const emit = defineEmits<EmitProps>()

const domain = useDomainStore()
const { domainInfo } = storeToRefs(domain)
const cropperRef = ref()
const submitLoading = ref(false)
// const reloadLoading = ref(true)
const previewUrl = ref<any>()
const imgLocation = ref<any>({})
const div = ref<any>()

const realTime = (data: any) => {
  previewUrl.value = data.url
  imgLocation.value = data.img
  div.value = data.div
}

const handleConfirmCropper = () => {
  submitLoading.value = true
  cropperRef.value.getCropBlob(async (data: any) => {
    let formData = new FormData()
    formData.append('file', data, new Date().getTime() + '.png')
    // 打接口获取图片url
    try {
      const res = await uploadImage(formData)
      const img = window.URL.createObjectURL(data)
      if (res.data.code === 200) {
        emit('handleCropSuccess', res.data.data.url, img)
      } else {
        Notification.error('当前图片违规')
      }
      submitLoading.value = false
    } catch (e) {
      submitLoading.value = false
    }
  })
}

// const handleReady = () => {
//   reloadLoading.value = false
// }

// onUnmounted(() => {
//   if (!cropperRef.value) return
//   cropperRef.value.cancelScale()
// })
</script>

<style scoped lang="scss">
.crop-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-between;
  width: 100%;
  .crop-content {
    width: 100%;
    height: 400px;
    flex-shrink: 0;
  }
  .crop-preview {
    flex-shrink: 0;
    text-align: right;
    margin-top: 24px;
  }
}
</style>
