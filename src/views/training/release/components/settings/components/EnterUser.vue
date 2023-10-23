<template>
  <Modal width="40%" mbile-width="95%" v-model:visible="visible" title="录入用户" :footer="false">
    <el-tabs v-model="activeName">
      <el-tab-pane :label="$t('快速录入')" :name="ESettingEnterMobile.quickEnter">
        <EnterMobileForm
          @handleClose="visible = false"
          @handleSubmit="(item) => $emit('handleEditSubmit', item)"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('文档上传')" :name="ESettingEnterMobile.uploadEnter">
        <a class="theme-color cursor-pointer" :href="downloadUrl" download="chato录入模板">
          {{ $t('点击此处下载模板') }}
        </a>
        <el-upload
          class="mt-3"
          v-model:file-list="uploadFileList"
          :action="apiUpload"
          :accept="acceptFileTypes"
          :before-upload="beforeUpload"
          :on-error="handleError"
          :on-success="handleSuccess"
          :limit="20"
          multiple
          :headers="headers"
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            {{ $t('将文件拖到此处，或') }}<em>{{ $t('点击上传') }}</em>
          </div>
        </el-upload>
      </el-tab-pane>
    </el-tabs>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ESettingEnterMobile } from '@/enum/release'
import EnterMobileForm from './EnterMobileForm.vue'
import { UPLOAD_TEMPLATE_FILE_TYPES } from '@/constant/common'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { ElNotification as Notification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import * as url from '@/utils/url'
import { currentEnvConfig } from '@/config'
import { postMobileLimitFileAPI } from '@/api/release'

const emit = defineEmits(['update:value', 'handleReloadList', 'handleEditSubmit'])
const props = defineProps<{
  value: boolean
  domainId: number
}>()

const { t } = useI18n()
const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
const sizeLimit = 30
const headers = {
  Authorization: 'Bearer ' + authToken.value
}
const acceptFileTypes = UPLOAD_TEMPLATE_FILE_TYPES.join(',')
const downloadUrl =
  'https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato/org_208/8ee244e6393e6b4e70ded49a008eff6b.xlsx'
const activeName = ref<ESettingEnterMobile.quickEnter>(ESettingEnterMobile.quickEnter)
const uploadFileList = ref([])

const apiUpload = url.join(currentEnvConfig.uploadBaseURL, '/chato/api/file/upload/file')

const visible = computed({
  get: () => props.value,
  set: (val) => {
    emit('update:value', val)
  }
})

const beforeUpload = (rawFile: UploadRawFile) => {
  const fileType = rawFile.name.substring(rawFile.name.lastIndexOf('.')).toLowerCase()
  const size = rawFile.size / 1024 / 1024
  if (!UPLOAD_TEMPLATE_FILE_TYPES.includes(fileType)) {
    Notification.error(t('不支持{fileType}格式', { fileType }))
    return false
  }

  if (UPLOAD_TEMPLATE_FILE_TYPES.includes(fileType) && size > sizeLimit) {
    Notification.error(
      t('文件 “{name}” 体积已超过 {sizeLimit}MB，暂时无法上传。', {
        name: rawFile.name,
        sizeLimit: sizeLimit
      })
    )
    return false
  }
}

const handleSuccess = async (response: any, uploadFile: UploadFile) => {
  await postMobileLimitFileAPI(props.domainId, response.data.url)
  uploadFileList.value = uploadFileList.value.filter((item) => item.uid !== uploadFile.uid)
  Notification.success(t('录入成功'))
  emit('handleReloadList')
}

const handleError = (err) => {
  const errMessage = err.message || ''
  const errName = err.name || ''
  if (errMessage.includes(t('该文件已上传'))) {
    Notification.error(t('您上传的文件已存在，无需重复上传。'))
  } else if (errName === 'UploadAjaxError' && errMessage.includes('fail to post')) {
    Notification.error(t('文件体积已超过限制，暂时无法上传。'))
  }
}
</script>

<style scoped></style>
