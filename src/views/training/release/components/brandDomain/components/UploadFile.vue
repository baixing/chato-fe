<template>
  <el-upload
    ref="upload"
    v-model:file-list="fileList"
    class="upload-file-key"
    :action="apiUpload"
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :before-remove="beforeRemove"
    :on-exceed="handleExceed"
    :on-success="handleSuccess"
    :limit="1"
    :headers="headers"
    :accept="acceptType"
  >
    <div class="flex flex-wra">
      <el-button size="large">{{ name }}</el-button>
      <span class="text-[#9DA3AF] text-xs mt-3 ml-3">{{ extra }}</span>
    </div>
  </el-upload>
</template>
<script lang="ts" setup>
import type { UploadResType } from '@/components/ImgUpload/data'
import { useAuthStore } from '@/stores/auth'
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { ElMessageBox, genFileId } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const emit = defineEmits(['update:value'])
const props = defineProps<{
  value: UploadResType[]
  disabled: boolean
  apiUpload: string
  name: string
  extra: string
  acceptType: string
}>()
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const headers = {
  Authorization: 'Bearer ' + authToken.value
}
const upload = ref<UploadInstance>()
const fileList = computed<UploadResType[]>({
  get: () => props.value,
  set: (val) => {
    return emit('update:value', val)
  }
})

const handleRemove: UploadProps['onRemove'] = (file, uploadFiles) => {
  console.log(file, uploadFiles)
}

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  console.log(uploadFile)
}

const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}

const beforeRemove: UploadProps['beforeRemove'] = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(
    t('你确定要移除 {slot1} 吗?', { slot1: uploadFile.name }),
    t('温馨提示'),
    {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消'),
      type: 'warning'
    }
  ).then(
    () => true,
    () => false
  )
}

const handleSuccess = () => {
  fileList.value = fileList.value.map((item) => {
    return {
      ...item,
      url: item.response.data.url
    }
  })
}
</script>
<style lang="scss" scoped>
.upload-file-key {
  position: relative;
  // display: flex;
  // align-items: center;
}
</style>
