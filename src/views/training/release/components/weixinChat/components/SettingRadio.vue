<template>
  <Modal
    width="40%"
    mobile-width="95%"
    v-model:visible="visible"
    :title="$t('设置定时广播')"
    :footer="false"
  >
    <el-form label-position="top" ref="radioRef" :rules="radioRule" :model="radioForm">
      <el-form-item prop="status">
        <el-switch
          v-model="radioForm.status"
          size="large"
          active-text="打开"
          inactive-text="关闭"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="时间段" prop="trigger_time">
        <el-time-select
          v-model="radioForm.trigger_time"
          start="08:30"
          step="00:05"
          end="24:00"
          size="large"
          class="w-full"
          placeholder="请选择时间段"
        />
      </el-form-item>
      <el-form-item label="重复" prop="send_pattern">
        <el-select
          v-model="radioForm.send_pattern"
          class="w-full"
          placeholder="repeat"
          size="large"
        >
          <el-option
            v-for="item in repeatOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="广播语" prop="content">
        <HansInputLimit
          v-model:value="radioForm.content"
          type="textarea"
          size="large"
          :rows="5"
          :placeholder="$t(`请输入广播语`)"
          :limit="2048"
          class="w-full"
        />
      </el-form-item>
      <el-form-item>
        <ImgUpload :value="radioForm.attachment" v-bind="uploadConfig" @onChange="handleChange" />
      </el-form-item>
      <el-form-item class="justify-end">
        <el-row class="w-full" justify="end">
          <el-col :sm="12" :xs="12" :md="12" :xl="4" :lg="4">
            <el-button type="primary" size="large" @click="onSubmit(radioRef)">{{
              $t('确认')
            }}</el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </Modal>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ref, computed, watch, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { currentEnvConfig } from '@/config'
import * as url from '@/utils/url'
import type { MediaItem } from '@/components/ImgUpload/data'
import type { ISettingBroadcastType } from '@/interface/release'
import { $notnull } from '@/utils/help'
import { getStringWidth } from '@/utils/string'

const emit = defineEmits(['update:value', 'handleSubmit'])
const props = defineProps<{
  value: boolean
  defaultItem: ISettingBroadcastType
}>()

const { t } = useI18n()
const radioRef = ref<FormInstance>()
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
const repeatOptions = [
  {
    label: '每天重复',
    value: 1
  }
]
const contentMaxLength = 2048
const contentExceedLimit = computed(() => getStringWidth(radioForm.content) > contentMaxLength)
const baseURL = currentEnvConfig.uploadBaseURL
const apiUploadImg = url.join(baseURL, '/chato/api/file/upload/file')

const uploadConfig = {
  uploadType: 1, // 1: 直接上传; 2: 打开图库上传
  cropProps: {
    aspectRatio: [1, 1], // 默认裁剪比例
    autoAspectRatio: false, // 是否允许修改裁剪比例
    notSelectCrop: true
  },
  showUploadList: {
    // 可操作按钮
    showCropIcon: true,
    showPreviewIcon: true,
    showRemoveIcon: true,
    showDownloadIcon: true
  },
  maxLength: 9, // 限制上传数量
  apiUploadPath: apiUploadImg, // 上传路径
  itemWidth: 64,
  itemHeight: 64,
  uploadBtnText: t('上传图片') // 上传文案
}

const radioForm = reactive({
  status: true,
  trigger_time: '',
  send_pattern: 1,
  channel: 1,
  content: '',
  attachment: []
})

const radioRule = reactive<FormRules>({
  trigger_time: [{ required: true, message: '请选择时间段', trigger: 'blur' }],
  send_pattern: [{ required: true, message: '请选择重复方式', trigger: 'blur' }],
  content: [{ required: true, message: '请输入广播语', trigger: 'blur' }]
})

const handleReset = () => {
  radioForm.status = true
  radioForm.trigger_time = ''
  radioForm.send_pattern = 1
  radioForm.channel = 1
  radioForm.content = ''
  radioForm.attachment = []
}

const handleChange = (value: MediaItem[]) => {
  radioForm.attachment = value.length > 0 ? value.map((item) => item.url) : []
}

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  if (contentExceedLimit.value) {
    return ElMessage.warning(`${t('广播语长度不能超过')}${contentMaxLength}`)
  }
  await formEl.validate((valid) => {
    if (valid) {
      const emitRadioForm = {
        ...radioForm,
        status: Number(radioForm.status),
        trigger_time: `${radioForm.trigger_time}:00`,
        attachment: radioForm.attachment.map((item) => ({ url: item, type: 1 }))
      }
      emit('handleSubmit', emitRadioForm)
    }
  })
}

watch(
  () => props.defaultItem,
  (v) => {
    if ($notnull(v)) {
      for (let key in v) {
        radioForm[key] = v[key]
      }
      radioForm.status = Boolean(v.status)
      radioForm.trigger_time = v.trigger_time.slice(0, 5)
      const attachmentImg = radioForm.attachment.filter((item) => item.type === 1)
      if (attachmentImg.length > 0) {
        radioForm.attachment = attachmentImg.map((item) => item.url)
      }
    } else {
      handleReset()
    }
  },
  { deep: true }
)
</script>
