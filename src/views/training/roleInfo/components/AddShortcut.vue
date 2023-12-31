<template>
  <Modal v-model:visible="visible" :title="title" append-to-body @cancel="handleCloseDialogVisble">
    <el-form
      ref="ruleFormRef"
      size="large"
      :disabled="inputTextForm.status === 'preview'"
      :rules="rules"
      :model="inputTextForm"
      class="input-text-form special-text-form"
      @submit.prevent
    >
      <p style="margin-top: 8px; margin-bottom: 8px; height: 24px">
        {{ $t('关键词') }}
      </p>
      <el-form-item prop="title">
        <HansInputLimit
          v-model:value="inputTextForm.title"
          type="text"
          size="large"
          :placeholder="$t(`输入关键词`)"
          :limit="20"
          class="w-full"
        />
      </el-form-item>
      <p style="margin-top: 8px; margin-bottom: 8px; height: 24px">
        {{ $t('回复内容') }}
      </p>
      <el-form-item prop="response" class="content_html_item">
        <HansInputLimit
          v-model:value="inputTextForm.response"
          type="textarea"
          :placeholder="$t(`输入回复内容。如需网页链接跳转，请直接填写域名，例如:http://chato.cn`)"
          :rows="4"
          :limit="limitTextPrompt"
          class="w-full mb-4"
        />
      </el-form-item>
      <p style="margin-bottom: 8px; height: 24px">
        {{ $t('图片（最多上传9张）') }}
      </p>
      <el-form-item prop="images" class="content_html_item">
        <ImgUpload
          v-model:img-url="inputTextForm.images"
          listType="picture-card"
          :fixed="false"
          :disabled="inputTextForm.status === 'preview'"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer" v-if="inputTextForm.status !== 'preview'">
        <el-button @click="emit('closeDialogVisble')">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="submitInputText(ruleFormRef)">
          {{ $t('确认') }}
        </el-button>
      </span>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import Modal from '@/components/Modal/index.vue'
import type { TDefaultShortcutProps } from '@/interface/userInterface'
import ImgUpload from '@/components/ImgUpload/ImgUpload.vue'
import { $notnull } from '@/utils/help'
import { getStringWidth } from '@/utils/string'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps<{
  dialogVisible: boolean
  apiUpload: string
  defaultForm: TDefaultShortcutProps
}>()

const emit = defineEmits(['closeDialogVisble', 'setSuccess'])
const title = computed<string>(() => {
  let ope = t('查看')
  if (props.defaultForm.status === 'create') {
    ope = t('添加')
  } else if (props.defaultForm.status === 'edit') {
    ope = t('编辑')
  }
  return t('{ope}菜单栏', { ope: ope })
})

const visible = ref(false)
const ruleFormRef = ref<FormInstance>()

const limitTextPrompt = 3000
const inputTextForm = reactive({
  title: null,
  response: null,
  images: [],
  status: 'create',
  index: 0
})

const validateTitle = (rule: any, value: any, callback: any) => {
  const valHansLen = getStringWidth(value)
  if (!value) {
    callback(new Error(t('请输入关键词')))
  } else if (valHansLen < 2) {
    callback(new Error(t('关键词最短不少于 2 个字符')))
  } else if (valHansLen > 20) {
    callback(new Error(t('关键词最长不超过 20 个字符')))
  } else {
    callback()
  }
}

const validateResponse = (rule: any, value: any, callback: any) => {
  const valHansLen = getStringWidth(value)
  if (!value) {
    callback(new Error(t('请输入回复内容')))
  } else if (valHansLen < 2) {
    callback(new Error(t('回复内容最短不少于 2 个字符')))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  title: [{ validator: validateTitle, trigger: 'change' }],
  response: [{ validator: validateResponse, trigger: 'change' }]
})

const $textExceedLimit = computed(() => {
  return getStringWidth(inputTextForm.response + inputTextForm.title || '') > limitTextPrompt
})

async function submitInputText(formEl) {
  if (!formEl) {
    return
  }
  if ($textExceedLimit.value) {
    return ElMessage.warning(
      t('「关键词」加「回复内容」长度不能超过 {limitTextPrompt} 字符！', {
        limitTextPrompt: limitTextPrompt
      })
    )
  }

  await formEl.validate((valid, fields) => {
    if (valid) {
      emit('setSuccess', {
        title: inputTextForm.title,
        response: inputTextForm.response,
        images: inputTextForm.images,
        status: inputTextForm.status,
        index: inputTextForm.index
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}

const handleCloseDialogVisble = () => {
  if (ruleFormRef.value) ruleFormRef.value.resetFields()
  inputTextForm.status === 'create'
  emit('closeDialogVisble')
}

watch(
  props,
  (v) => {
    visible.value = v.dialogVisible
    const obj = v.defaultForm ? { ...v.defaultForm } : undefined
    if (ruleFormRef.value) ruleFormRef.value.resetFields()
    let list = []
    inputTextForm.title = obj.title || ''
    inputTextForm.response = obj.response || ''
    inputTextForm.status = obj.status || 'create'
    inputTextForm.index = obj.index || 0
    if ($notnull(obj.images)) {
      list = obj.images
    } else if ($notnull(obj.image)) {
      list = [obj.image]
    }
    inputTextForm.images = list
  },
  { immediate: true, deep: true }
)
</script>
<style lang="scss" scoped>
.content_html_item {
  :deep(.el-form-item__error) {
    bottom: 0 !important;
    top: inherit !important;
  }
}
</style>
