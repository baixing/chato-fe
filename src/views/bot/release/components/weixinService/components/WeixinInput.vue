<template>
  <div class="w-full text-[14px]">
    <slot></slot>
    <p class="text-[#7C5CFC] text-[12px]">
      <el-button type="primary" link @click="emit('changesketchDialogVisible', url)">{{
        $t('查看示意图')
      }}</el-button>
    </p>
    <el-form
      ref="formInputRef"
      :model="formInput"
      :rules="formInputRules"
      label-width="100px"
      labelPosition="left"
      size="large"
      status-icon
      class="w-full mt-[16px]"
    >
      <el-form-item :label="labelName" prop="input">
        <el-input
          class="max-w-[60%] md:max-w-full"
          v-model="formInput.input"
          :placeholder="placeholder"
        />
      </el-form-item>
      <WeixinBtn
        :disabled="!formInput.input"
        :btnText="btnText"
        @handleBtn="() => submitForm(formInputRef)"
        @handleCancle="emit('handleCancle')"
      />
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import type { FormInstance } from 'element-plus'
import { reactive, ref } from 'vue'
import WeixinBtn from './WeixinBtn.vue'

const props = defineProps<{
  placeholder: string
  labelName: string
  btnText: string
  url: string
}>()
const emit = defineEmits(['handleBtn', 'handleCancle', 'changesketchDialogVisible'])

const formInput = reactive({
  input: ''
})

const formInputRules = reactive({
  input: [{ required: true, message: props.placeholder }]
})

const formInputRef = ref<FormInstance>()

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      emit('handleBtn', formInput)
    }
  })
}
</script>
