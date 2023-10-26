<template>
  <el-upload
    :action="apiUploadPath"
    :file-list="fileList"
    accept=".jpg,.jpeg,.png,.JPG,.JPEG,.PNG"
    list-type="picture-card"
    :disabled="disabled"
    :auto-upload="true"
    :on-change="handleChange"
    :on-success="handleSuccess"
    :before-upload="beforerUpload"
    :headers="headers"
    :multiple="true"
    :limit="maxLength"
  >
    <template #file="{ file }">
      <ImgItem
        v-if="itemRender"
        :file="file"
        :fileIndex="currentIndex(file, fileList)"
        :disabled="disabled"
        :itemWidth="itemWidth"
        :itemHeight="itemHeight"
        :showUploadList="showUploadList"
        :fileList="fileList"
        :uploadFillet="uploadFillet"
        @onCrop="(file, index) => emit('handleCrop', file, index)"
        @onRemove="(file, index) => emit('handleRemove', file, index)"
        @onPreview="(file, index) => emit('handlePreview', file, index)"
        @onMove="(file, index: -1 | 1) => emit('handleMove', file, currentIndex(file, fileList), index)"
      />
      <div v-else></div>
    </template>
    <template #trigger>
      <UploadBtn
        v-if="showUploadBtn"
        :uploadBg="uploadBg"
        :uploadType="1"
        :uploadFillet="uploadFillet"
        :text="uploadBtnText"
        :disabled="disabled"
        :itemWidth="itemWidth"
        :itemHeight="itemHeight"
      />
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { $notnull } from '@/utils/help'
import { isImageUrl, verifyImageReg } from '@/utils/reg'
import { getFileBase64 } from '@/utils/url'
import type { UploadFile, UploadFiles, UploadRawFile } from 'element-plus'
import { ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref, toRefs, watch } from 'vue'
import type { ImgUploadContextInitConfig, ImgVideoUploadFile, UploadResDataType } from '../../data'
import ImgItem from '../ImgItem/index.vue'
import UploadBtn from '../UploadBtn/index.vue'

interface Props {
  disabled?: boolean
  fileList: ImgVideoUploadFile[]
  initConfig: ImgUploadContextInitConfig
  curentUploadingLengthProp?: boolean
}

interface EmitProps {
  (
    e: 'handleChangeFileList',
    newFileList: ImgVideoUploadFile[],
    oldFileList: ImgVideoUploadFile[]
    // file: ImgVideoUploadFile
  ): void
  (e: 'handlePreview', file: ImgVideoUploadFile, fileIndex: number): void
  (e: 'handleRemove', file: ImgVideoUploadFile, fileIndex: number): void
  (e: 'handleCrop', file: ImgVideoUploadFile, fileIndex: number): void
  (e: 'handleMove', file: ImgVideoUploadFile, fileIndex: number, order: -1 | 1)
}

const props = defineProps<Props>()
const emit = defineEmits<EmitProps>()

const curentUploadingLength = ref<number>(0)
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const headers = {
  Authorization: 'Bearer ' + authToken.value
}
const { fileList, initConfig } = toRefs(props)

// 注意：响应式可能会丢失
const {
  uploadType,
  unique,
  maxSize,
  maxLength,
  itemWidth,
  apiUploadPath,
  uploadBtnText,
  itemHeight,
  cropProps,
  uploadFillet,
  itemRender = true
} = initConfig.value

const uploadBg = computed(() => props.initConfig.uploadBg)
const showUploadList = computed(() => props.initConfig.showUploadList)

const showUploadBtn = computed(
  () => props.fileList.length + curentUploadingLength.value < maxLength
)

const currentIndex = (file: UploadFile, list: ImgVideoUploadFile[]): number => {
  const index = list.findIndex((item) => item.uid === file.uid)
  return index > 0 ? index : 0
}

const setCropItem = async (file: UploadRawFile) => {
  const filrUrl = await getFileBase64(file)
  const cropItem: ImgVideoUploadFile = {
    uid: file.uid,
    status: 'uploading',
    thumbUrl: filrUrl as string,
    preview: filrUrl as string,
    url: '',
    size: 0,
    name: '',
    raw: file,
    type: 'IMAGE'
  }
  emit('handleCrop', cropItem, fileList.value.length - 1)
}

const checkUrlUnique = (fileList: ImgVideoUploadFile[], url: string) => {
  return fileList.some((item) => item.url?.indexOf(url) !== -1)
}

const getUrl = (item: any) => {
  if (item.response && item.response.data.url) return item.response.data.url
  if (isImageUrl(item.url)) return item.url
  return item.url
}

const handleSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {}

const handleChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  if (!verifyImageReg(uploadFile.name)) return
  curentUploadingLength.value = uploadFiles.filter((f) => f.status !== 'success').length
  if (uploadFile.status) {
    const oldFileList = fileList.value.filter((item) => item.uid !== uploadFile.uid)
    uploadFile.status === 'success' &&
      curentUploadingLength.value > 0 &&
      curentUploadingLength.value--
    // 在禁止选择重复图片时需要在 status===’success‘下检查重复
    if (
      uploadFile.status === 'success' &&
      unique &&
      $notnull((uploadFile.response as any).data) &&
      checkUrlUnique(oldFileList, (uploadFile.response as any).data.url!)
    ) {
      uploadFile.status === 'success' && emit('handleChangeFileList', oldFileList, oldFileList)
      Notification.error('请勿上传重复图片')
    } else {
      const allSuccess = uploadFiles.every((u) => u.status === 'success')
      if (allSuccess) {
        const normalFileList = []
        uploadFiles.forEach((item) => {
          if (
            $notnull((item?.response as UploadResDataType)?.data) ||
            !item.url.includes('blob:')
          ) {
            const normalItem = {
              ...item,
              thumbUrl: getUrl(item),
              preview: getUrl(item),
              url: getUrl(item),
              type: 'IMAGE'
            }
            normalFileList.push(normalItem)
          } else {
            Notification.error('当前上传存在违规图片')
          }
        })
        emit('handleChangeFileList', normalFileList, oldFileList)
      }
    }
  }
}

const beforerUpload = (rawFile: UploadRawFile) => {
  if (!verifyImageReg(rawFile.name)) {
    Notification.error('只允许上传.jpg、.jpeg、.png格式的图片！')
    return false
  }

  if (rawFile.size / 1024 / 1024 > maxSize) {
    Notification.error('上传图片最大不超过2MB!')
    return false
  }

  // 判断上传前需不需要裁剪：不调用图片库的时候才需要判断上传前是否要裁剪前编辑。
  if (uploadType === 1 && !cropProps.notSelectCrop) {
    setCropItem(rawFile)
    return false
  }

  return true
}

const watchProps = watch(
  () => props.curentUploadingLengthProp,
  () => {
    curentUploadingLength.value = 0
  }
)
onUnmounted(() => {
  watchProps()
})
</script>

<style scoped lang="scss">
:deep(.el-upload--picture-card) {
  height: 100%;
  width: auto;
  border: none;
  background-color: transparent;
}
:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: auto;
  height: auto;
  border-radius: 0;
  border: none;
  background-color: transparent;
  &:last-of-type {
    margin: 0;
  }
}
</style>
