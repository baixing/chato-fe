<template>
  <el-form ref="joinForm" class="w-full" :model="joinFormModel" :rules="joinFormRule">
    <el-form-item prop="name">
      <el-input
        :placeholder="$t('姓名（必填）')"
        size="large"
        maxlength="10"
        v-model="joinFormModel.name"
      />
    </el-form-item>
    <el-form-item prop="company">
      <el-input
        :placeholder="$t('公司名称（必填）')"
        size="large"
        v-model="joinFormModel.company"
      />
    </el-form-item>
    <el-form-item prop="mobile">
      <el-input
        :placeholder="$t('联系电话（必填）')"
        size="large"
        v-model.number="joinFormModel.mobile"
      />
    </el-form-item>
    <el-form-item prop="email">
      <el-input :placeholder="$t('联系邮箱（选填）')" size="large" v-model="joinFormModel.email" />
    </el-form-item>
    <el-form-item prop="other">
      <el-input :placeholder="$t('备注（选填）')" size="large" v-model="joinFormModel.other" />
    </el-form-item>
    <el-form-item>
      <el-button
        class="!border-none w-full !h-12 !rounded-lg tracking-[0.08em] !text-sm !text-white mb-4 mt-2 hover:opacity-80"
        type="primary"
        size="large"
        @click="onSubmit"
        >{{ $t('提交申请') }}</el-button
      >
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import useGlobalProperties from '@/composables/useGlobalProperties'
import { EMAIL_REG, MOBILE_REG } from '@/constant/common'
import dayjs from 'dayjs'
import type { FormInstance, FormRules } from 'element-plus'
import { ElNotification } from 'element-plus'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['submit'])
const { $sensors } = useGlobalProperties()
const joinForm = ref<FormInstance>()
const joinFormRule = ref<FormRules>({
  name: [{ required: true, message: t('请输入您的姓名'), trigger: 'blur' }],
  company: [{ required: true, message: t('请输入您的公司名称'), trigger: 'blur' }],
  mobile: [
    { required: true, message: t('请输入您的联系方式'), trigger: 'blur' },
    { pattern: MOBILE_REG, message: t('请输入联系方式'), trigger: 'blur' }
  ],
  email: [{ pattern: EMAIL_REG, message: t('请输入正确邮箱'), trigger: 'blur' }]
})
const joinFormModel = reactive({
  name: '',
  company: '',
  mobile: '',
  email: '',
  other: ''
})

const onSubmit = async () => {
  await joinForm.value.validate()
  $sensors.track('home_join_call_back', {
    name: t(`首页-招商加盟`),
    type: 'home_join_call_back',
    data: { ...joinFormModel, time: dayjs().format('YYYY-MM-DD HH:mm:ss') }
  })
  joinForm.value.resetFields()
  ElNotification.success(t('提交成功'))
  emit('submit')
}
</script>
