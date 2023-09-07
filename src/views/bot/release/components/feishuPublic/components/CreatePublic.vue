<template>
  <div class="text-sm text-[#303133]">
    <p class="mb-[16px]">
      <a
        href="//baixingwang.feishu.cn/docx/EVnjdnXoEoIGjexNwOqcXFFYncl"
        target="_blank"
        class="theme-color"
        >{{ $t('查看配置教程') }}</a
      >
    </p>
    <p class="mb-[20px]">
      {{ $t('进入')
      }}<a href="//open.feishu.cn/" target="_blank" class="text-[#0256FF]">{{
        $t('「飞书开放平台」')
      }}</a
      >{{ $t('完成设置，填写以下信息') }}
    </p>
    <div class="w-full flex justify-start">
      <el-form
        ref="createPublicFormRef"
        :rules="createPublicRule"
        :model="createPublicForm"
        size="large"
        labelPosition="left"
        label-width="140px"
        status-icon
        class="w-full"
      >
        <el-form-item label="APP ID" prop="app_id">
          <el-input
            class="max-w-[60%] md:max-w-full"
            v-model="createPublicForm.app_id"
            :placeholder="$t(`请填写APP ID`)"
          />
        </el-form-item>
        <el-form-item label="APP Secret" prop="app_secret">
          <el-input
            class="max-w-[60%] md:max-w-full"
            v-model="createPublicForm.app_secret"
            :placeholder="$t(`请填写APP Secret`)"
          />
        </el-form-item>
        <el-form-item label="Encrypt Key" prop="encrypt_key">
          <el-input
            class="max-w-[60%] md:max-w-full"
            v-model="createPublicForm.encrypt_key"
            :placeholder="$t(`请填写Encrypt Key`)"
          />
        </el-form-item>
        <el-form-item label="Verification Token" prop="verification_token">
          <el-input
            class="max-w-[60%] md:max-w-full"
            v-model="createPublicForm.verification_token"
            :placeholder="$t(`请填写Verification Token`)"
          />
        </el-form-item>
        <el-form-item class="!mb-[0]" label-width="0">
          <el-row class="w-full" justify="end" :span="24" :gutter="12">
            <el-col :lg="6" :xl="6" :xs="12" :sm="12" :md="12">
              <el-button @click="() => emit('handleClose')">{{ $t('取消') }}</el-button>
            </el-col>
            <el-col :lg="6" :xl="6" :xs="12" :sm="12" :md="12">
              <el-button type="primary" @click="() => onSubmit(createPublicFormRef)">{{
                $t('提交')
              }}</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { feishuiPublicFormType } from '@/interface/release'
import type { FormInstance } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const emit = defineEmits(['handleClose', 'handleSubmit'])
const props = defineProps<{
  feishuConfig: feishuiPublicFormType
}>()

const createPublicRule = reactive({
  app_id: [{ required: true, message: t('请填写开发者ID'), trigger: 'blur' }],
  app_secret: [{ required: true, message: t('请填写开发者密码'), trigger: 'blur' }],
  encrypt_key: [{ required: true, message: t('请填写开发者密码'), trigger: 'blur' }],
  verification_token: [{ required: true, message: t('请填写开发者密码'), trigger: 'blur' }]
})

const createPublicForm = reactive<feishuiPublicFormType>({
  app_id: '',
  app_secret: '',
  encrypt_key: '',
  verification_token: ''
})

const createPublicFormRef = ref()

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      emit('handleSubmit', createPublicForm)
    }
  })
}

const watchCreatePublicForm = watch(
  () => props.feishuConfig,
  (v) => {
    createPublicForm.app_id = v.app_id
    createPublicForm.app_secret = v.app_secret
    createPublicForm.encrypt_key = v.encrypt_key
    createPublicForm.verification_token = v.verification_token
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  watchCreatePublicForm()
})
</script>
