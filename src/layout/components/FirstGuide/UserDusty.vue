<template>
  <div class="w-full userDusty-container">
    <el-form label-position="top" :rules="rules" :model="form">
      <el-form-item :label="$t('称呼（选填）')" prop="surname"> </el-form-item>
      <el-form-item :label="$t('职位')" prop="job">
        <el-select
          v-model="form.job"
          size="large"
          class="w-full"
          :placeholder="$t('请选择您在公司中的职责角色')"
          popper-class="popperClass"
        >
          <el-option v-for="item in jobList" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

defineProps<{
  jobList: string[]
}>()
const emit = defineEmits(['handleChange'])
const rules = reactive({
  job: [{ required: true, message: '请选择您在公司中的职责角色', trigger: 'blur' }]
})
const identityList = [
  {
    name: '企业用户',
    icon: 'enterprise-users',
    label: '公司名称',
    placeholder: '请输入公司名称'
  },
  {
    name: '个人用户',
    icon: 'individual-users',
    label: '您的称呼',
    placeholder: '例如张女士、李先生'
  },
  {
    name: '其他组织',
    icon: 'others-users',
    label: '组织名称',
    placeholder: '请输入组织名称'
  }
]

const form = reactive({
  surname: '',
  company: '',
  input: ''
})

watch(form, (v) => {
  emit('handleChange', v)
})
</script>

<style scoped lang="scss">
.userDusty-container {
  :deep(.el-input__wrapper) {
    border-radius: 9999px;
  }
}
</style>
<style lang="scss">
.popperClass {
  z-index: 999999 !important;
}
</style>
