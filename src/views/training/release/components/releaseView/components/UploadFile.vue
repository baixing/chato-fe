<template>
  <el-upload
    ref="upload"
    v-model:file-list="fileList"
    class="relative"
    action="#"
    :before-remove="beforeRemove"
    :on-change="onUploadChange"
    :limit="5"
    :headers="headers"
    :auto-upload="false"
    :accept="limitType.join(',')"
  >
    <div class="flex flex-wra">
      <el-button size="large" :disabled="disabled">{{ name }}</el-button>
      <span class="text-[#9DA3AF] text-xs mt-3 ml-3">{{ extra }}</span>
    </div>
  </el-upload>
</template>
<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth'
import type {
  UploadFile,
  UploadFiles,
  UploadInstance,
  UploadProps,
  UploadUserFile
} from 'element-plus'
import { ElMessageBox, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const emit = defineEmits(['update:value'])
const props = defineProps<{
  value: UploadUserFile[]
  disabled: boolean
  name: string
  extra: string
  maxSize: number
  limitType: string[]
}>()
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const headers = {
  Authorization: 'Bearer ' + authToken.value
}
const upload = ref<UploadInstance>()
const fileList = computed<UploadUserFile[]>({
  get: () => props.value,
  set: (val) => {
    return emit('update:value', val)
  }
})

const beforeRemove: UploadProps['beforeRemove'] = (uploadFile) => {
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

const onUploadChange = (rawFile: UploadFile, rawFiles: UploadFiles) => {
  const fileType = rawFile.name.substring(rawFile.name.lastIndexOf('.')).toLowerCase()
  const size = rawFile.size / 1024 / 1024

  if (size > props.maxSize) {
    Notification.error(
      t('文件 “{name}” 体积已超过 {sizeLimit}MB，暂时无法上传。', {
        name: rawFile.name,
        sizeLimit: props.maxSize
      })
    )
    fileList.value = rawFiles.filter((item) => item.uid !== rawFile.uid)
    return
  }

  if (!props.limitType.includes(fileType)) {
    Notification.error(t('不支持{fileType}格式', { fileType }))
    fileList.value = rawFiles.filter((item) => item.uid !== rawFile.uid)
    return
  }

  Notification.success(t('上传成功'))
}
</script>
