<template>
  <el-form ref="formRef" :rules="formRules" :model="form">
    <el-form-item size="large" prop="mobile">
      <el-input v-model="form.mobile" :placeholder="$t('手机号码')" />
    </el-form-item>
    <el-form-item size="large" prop="remark">
      <el-input v-model="form.remark" :placeholder="$t('备注')" />
    </el-form-item>
    <el-form-item class="flex justify-end">
      <el-row class="w-full gap-8" justify="end">
        <el-col :lg="4" :xl="4" :md="6" :xs="6" :sm="6">
          <el-button size="large" class="ml-3" @click="emit('handleClose')">
            {{ $t('取消') }}
          </el-button>
        </el-col>
        <el-col :lg="4" :xl="4" :md="6" :xs="6" :sm="6">
          <el-button size="large" type="primary" @click="handleSubmit(formRef)">
            {{ $t('确认') }}
          </el-button>
        </el-col>
      </el-row>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { validateMobile } from '@/utils/validate'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'

const props = withDefaults(
  defineProps<{
    id: number
    mobile: string
    remark: string
  }>(),
  {
    id: 0,
    mobile: '',
    remark: ''
  }
)
const emit = defineEmits(['handleClose', 'handleSubmit'])

const { t } = useI18n()
const formRef = ref<FormInstance>()
const form = reactive({
  id: 0,
  mobile: '',
  remark: ''
})

const formRules = reactive<FormRules>({
  mobile: [
    { required: true, message: t('请输入手机号'), trigger: 'blur' },
    { validator: validatorMobile, trigger: 'blur' }
  ],
  remark: [{ required: true, message: '请输入备注', trigger: 'blur' }]
})

function validatorMobile(rule, value, callback) {
  if (!validateMobile(value)) {
    callback(new Error(t('请输入正确的手机号')))
  } else {
    callback()
  }
}

const handleSubmit = async (ruleForm: FormInstance) => {
  if (!ruleForm) return
  await ruleForm.validate((valid) => {
    if (valid) {
      emit('handleSubmit', form)
      ruleForm.resetFields()
    }
  })
}

watch(
  props,
  (v) => {
    form.id = v.id
    form.mobile = v.mobile
    form.remark = v.remark
  },
  { immediate: true }
)
</script>

<style scoped></style>
