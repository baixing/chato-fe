<template>
  <el-upload
    :action="apiUpload"
    :accept="acceptFileTypes"
    :before-upload="beforeUpload"
    :on-success="replaceFileSuccess"
    :on-error="onError"
    :on-exceed="onExceed"
    :on-progress="pregressReplace"
    :limit="1"
    :headers="headers"
    :show-file-list="false"
  >
    <el-button link type="primary" class="!p-0 mt-[5px]" @click="replaceFile(row.id)">
      {{ showFilelist && replaceId === row.id ? $t('替换中') : $t('替换') }}
    </el-button>
  </el-upload>
</template>

<script setup lang="ts">
import { currentEnvConfig } from '@/config'
import { UPLOAD_FILE_TYPES, UPLOAD_TEMPLATE_FILE_TYPES, USER_ROLES } from '@/constant/common'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import * as url from '@/utils/url'
import { ElLoading, ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps<{
  domainId: string
  row: any
  type: 'file' | 'template'
}>()

const emit = defineEmits(['removeFile'])

const acceptFileTypes = computed(() => {
  const limitType = props.type === 'file' ? UPLOAD_FILE_TYPES : UPLOAD_TEMPLATE_FILE_TYPES
  return limitType.join(',')
})

const apiUpload = computed(() =>
  url.join(
    currentEnvConfig.uploadBaseURL,
    `/chato/api/domains/${props.domainId}/files/upload/document`
  )
)

const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const headers = {
  Authorization: 'Bearer ' + authToken.value
}

const base = useBase()

const sizeLimit = 30 // 单个文件的体积限制（MB）
const qtyLimit = base.userInfo.role === USER_ROLES.SUPERMAN ? 1000 : 20 // 同时上传的文件数量限制

// 替换文档状态
const replaceLoading = ref()
const replaceId = ref(null) // 当前要替换id
const showFilelist = ref(false)

const onError = (err) => {
  const errMessage = err.message || ''
  const errName = err.name || ''
  if (errMessage.includes(t('该文件已上传'))) {
    ElNotification.error(t('您上传的文件已存在，无需重复上传。'))
  } else if (errName === 'UploadAjaxError' && errMessage.includes('fail to post')) {
    ElNotification.error(t('文件体积已超过限制，暂时无法上传。'))
  }
  replaceLoading.value.close()
  showFilelist.value = false
}

const onExceed = () => {
  ElNotification.warning(
    t('您选择的文件数量过多，每次最多可上传 {qtyLimit} 个文件。', {
      qtyLimit: qtyLimit
    })
  )
}

const beforeUpload = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > sizeLimit) {
    ElNotification.error(
      t('文件 “{slot1}” 体积已超过 {sizeLimit}MB，暂时无法上传。', {
        slot1: rawFile.name,
        sizeLimit: sizeLimit
      })
    )
    return false
  }
}

// 替换文档（重新上传）
const replaceFile = (id) => {
  replaceId.value = id
}

// 替换成功后删除旧文档
const replaceFileSuccess = () => {
  showFilelist.value = false
  emit('removeFile', replaceId.value, t('替换成功'))
  replaceLoading.value.close()
}

const pregressReplace = () => {
  showFilelist.value = true
  replaceLoading.value = ElLoading.service({
    lock: true,
    text: t('替换中'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
}
</script>
