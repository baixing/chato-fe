<template>
  <el-form ref="formRef" :model="formState" :rules="formRules">
    <el-form-item prop="phone">
      <el-input
        v-model="formState.phone"
        :maxlength="11"
        size="large"
        :placeholder="$t(`请输入手机号（必填）`)"
        class="!rounded-lg"
      />
    </el-form-item>
    <el-form-item>
      <el-select
        v-model="formState.industry"
        :loading="industryState.loading"
        :placeholder="$t(`请选择行业`)"
        size="large"
        clearable
        class="!rounded-lg w-full"
      >
        <el-option
          v-for="(item, index) in industryState.list"
          :key="`industry_${index}`"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>
  </el-form>

  <el-button
    type="primary"
    :disabled="!protocolAgree"
    :class="[
      '!border-none w-full !h-12 !rounded-lg tracking-[0.08em] !text-sm !text-white mb-4 mt-2 hover:opacity-80',
      submitBtnClass
    ]"
    @click="onSubmit"
  >
    {{ submitBtnText }}
  </el-button>

  <el-checkbox v-model="protocolAgree">
    <p class="text-[13px] flex items-center whitespace-nowrap break-all">
      <span class="text-[#596780]">{{ $t('我已阅读并同意') }}</span>
      <el-link
        :underline="false"
        target="_blank"
        type="primary"
        class="!text-[13px] !font-normal ml-1"
        @click="openPreviewUrl(kUserAgreementLinkUrl)"
        >{{ $t('用户协议 ') }}</el-link
      >、<el-link
        :underline="false"
        target="_blank"
        type="primary"
        class="!text-[13px] !font-normal"
        @click="openPreviewUrl(kPrivacyLinkUrl)"
        >{{ $t('隐私政策') }}</el-link
      >
    </p>
  </el-checkbox>
</template>
<script lang="ts" setup>
import { getFirstGuideSelect } from '@/api/release'
import useGlobalProperties from '@/composables/useGlobalProperties'
import { kPrivacyLinkUrl, kUserAgreementLinkUrl } from '@/constant/terms'
import { openPreviewUrl } from '@/utils/help'
import dayjs from 'dayjs'
import { ElNotification } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus/es/components/form'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps<{
  submitBtnText: string
  submitBtnClass?: string
}>()

const emit = defineEmits(['submit'])

const defaultFormState = {
  phone: '',
  industry: ''
}

const formRef = ref<FormInstance>()
let formState = reactive({ ...defaultFormState })
const formRules = reactive<FormRules>({
  phone: [
    { required: true, message: t('手机号不能为空'), trigger: 'change' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: t('请输入正确的手机号'),
      trigger: 'change'
    }
  ]
})
const industryState = reactive({
  loading: false,
  list: []
})
const protocolAgree = ref(true)

const init = async () => {
  try {
    industryState.loading = true
    const {
      data: { data }
    } = await getFirstGuideSelect()
    industryState.list = data?.industry || []
  } catch (err) {
  } finally {
    industryState.loading = false
  }
}

const { $sensors } = useGlobalProperties()

const onSubmit = async () => {
  await formRef.value.validate()
  $sensors?.track('home_schedule_call_back', {
    name: t('首页-{slot1}', { slot1: props.submitBtnText }),
    type: 'home_schedule_call_back',
    data: { ...formState, time: dayjs().format('YYYY-MM-DD HH:mm:ss') }
  })

  formState = Object.assign(formState, defaultFormState)
  formRef.value.resetFields()
  ElNotification.success(t('预约成功'))
  emit('submit')
}

init()
</script>
