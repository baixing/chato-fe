<template>
  <div class="w-full">
    <el-form
      ref="createSingleGroupRef"
      size="large"
      label-position="top"
      :rules="createSingleGroupRules"
      :model="createSingleGroup"
    >
      <el-form-item :label="$t('选择账号')" prop="account">
        <el-select
          class="w-full"
          v-model="createSingleGroup.account"
          :placeholder="$t('请选择自定义账号')"
        >
          <el-option
            v-for="item in accountList"
            :key="item.wx_user_id"
            :label="item.name"
            :value="item.wx_user_id"
          />
        </el-select>
      </el-form-item>
      <p class="flex justify-start items-center text-[#596780]">
        {{ $t('是否使用自己的账号？') }}
        <el-button type="primary" link @click="emit('handleCreateAccount')">
          {{ $t('去创建') }}
        </el-button>
      </p>
    </el-form>
    <el-row class="w-full mt-2" justify="end" :gutter="20">
      <el-col :lg="4" :xl="4" :xs="12" :sm="12" :md="12">
        <el-button type="primary" size="large" @click="handleStep(createSingleGroupRef)">
          {{ $t('下一步') }}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import type { IAccountList } from '@/interface/release'

const props = defineProps<{
  accountList: IAccountList[]
  visible: boolean
}>()
const emit = defineEmits(['handleCreateAccount', 'handleSubmit'])

const { t } = useI18n()
const createSingleGroupRef = ref<FormInstance>()
const createSingleGroupRules = reactive<FormRules>({
  account: [{ required: true, trigger: 'blur', message: t('请选择自定义账号') }]
})
const createSingleGroup = reactive({
  account: ''
})

const handleStep = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      emit('handleSubmit', createSingleGroup)
    } else {
      console.log('error submit!', fields)
    }
  })
}

watch(
  () => props.visible,
  () => {
    createSingleGroup.account = ''
  },
  { immediate: true }
)
</script>
