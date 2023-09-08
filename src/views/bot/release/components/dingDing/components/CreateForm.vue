<template>
  <div class="text-sm text-[#303133]">
    <p class="mb-[16px]">
      <a
        href="//baixingwang.feishu.cn/docx/Xclxdn4qEoXM0cxYpSKcy6cIntd"
        target="_blank"
        class="theme-color"
      >
        {{ $t('查看配置教程') }}
      </a>
    </p>
    <p class="mb-[20px]">
      {{ $t('进入') }}
      <a
        href="//open.dingtalk.com/integration?integration-visible"
        target="_blank"
        class="text-[#0256FF]"
      >
        {{ $t('「钉钉开放平台」') }}
      </a>
      {{ $t('完成设置，填写以下信息') }}
    </p>
    <div class="w-full flex justify-start">
      <el-form
        ref="createPublicFormRef"
        :rules="createPublicRule"
        :model="createPublicForm"
        size="large"
        labelPosition="left"
        label-width="140px"
        class="w-full"
      >
        <el-form-item label="AppKey" prop="app_id">
          <el-input
            class="max-w-[60%] md:max-w-full"
            v-model="createPublicForm.app_id"
            :placeholder="$t('请填写APP Key')"
          />
        </el-form-item>
        <el-form-item label="APPSecret" prop="app_secret">
          <el-input
            class="max-w-[60%] md:max-w-full"
            v-model="createPublicForm.app_secret"
            :placeholder="$t('请填写APP Secret')"
          />
        </el-form-item>
        <el-form-item label-width="0" class="!mb-[16px]">
          <p class="text-[#9DA3AF]">{{ $t('注意：请使用钉钉管理员账号创建') }}</p>
        </el-form-item>
        <el-form-item class="!mb-[0]" label-width="0">
          <el-row class="w-full" justify="end" :span="24" :gutter="12">
            <el-col :lg="6" :xl="6" :xs="12" :sm="12" :md="12">
              <el-button @click="() => emit('handleClose')">{{ $t('取消') }}</el-button>
            </el-col>
            <el-col :lg="6" :xl="6" :xs="12" :sm="12" :md="12">
              <el-button type="primary" @click="() => onSubmit(createPublicFormRef)">
                {{ $t('提交') }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IDingDingPublicFormType } from '@/interface/release'
import { $notnull } from '@/utils/help'
import type { FormInstance } from 'element-plus'
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['handleClose', 'handleSubmit'])
const props = defineProps<{
  dingdingConfig: IDingDingPublicFormType
}>()

const createPublicRule = reactive({
  app_id: [{ required: true, message: t('请填写AppKey'), trigger: 'blur' }],
  app_secret: [{ required: true, message: t('请填写AppSecret'), trigger: 'blur' }]
})

const createPublicForm = reactive<IDingDingPublicFormType>({
  app_id: '',
  app_secret: ''
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

watch(
  () => props.dingdingConfig,
  (v) => {
    if ($notnull(v)) {
      createPublicForm.app_id = v.app_id
      createPublicForm.app_secret = v.app_secret
    }
  },
  { deep: true, immediate: true }
)
</script>

<style scoped lang="scss"></style>
