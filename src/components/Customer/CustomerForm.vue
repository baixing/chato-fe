<template>
  <div v-loading="loading">
    <el-result
      v-if="!formConfig.fields.length"
      title="暂无可填写的表单项"
      sub-title="如有问题可联系对话管理员"
    />
    <template v-else>
      <el-form ref="formRef" :model="formState" label-position="top" class="customer-form">
        <el-form-item
          v-for="(item, index) in formConfig.fields"
          :key="`form_config_${index}`"
          :label="item.name"
          :required="item.required"
        >
          <el-input
            v-model="formState[item.field_id]"
            :disabled="internalDisabled"
            :placeholder="`请输入${item.name}`"
          />
        </el-form-item>
      </el-form>
      <div class="flex gap-3 items-center justify-end mt-4">
        <el-button :disabled="internalDisabled" @click="onCancel">取消</el-button>
        <el-button
          :loading="submitting"
          :disabled="internalDisabled"
          type="primary"
          @click="onSubmit"
          class="!bg-[#303133] !border-none hover:opacity-80"
        >
          提交
        </el-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { getCustomerFormConfig, saveCustomerForm } from '@/api/customerForm'
import useByteDancePromotion, { postBytedancePromotion } from '@/composables/useByteDancePromotion'
import useChannel from '@/composables/useChannel'
import type { ICustomerFormConfig } from '@/interface/customerForm'
import Ajv from 'ajv'
import AjvErrors from 'ajv-errors'
import { ElMessage, ElNotification } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  id?: number | string
  uid?: string
  disabled?: boolean
}>()

const emit = defineEmits(['cancel', 'success'])

const route = useRoute()

const formRef = ref()
const loading = ref(false)
const submitting = ref(false)
const { bytedancePromotionClickid } = useByteDancePromotion()
const internalId = computed(
  () => props.id || (route.query.form_id as string) || (route.params.formId as string)
)
const internalDisabled = computed(() => props.disabled)
let formState = reactive<Record<string, any>>({})
const formConfig = ref<Partial<ICustomerFormConfig>>({
  fields: [],
  schema: {}
})

const ajv = AjvErrors(new Ajv({ allErrors: true }))

const fieldsNameMapper: Record<string, string> = {}

const resetFormState = () => {
  for (const key in formState) {
    delete formState[key]
  }
  formRef.value.clearValidate()
}

const { shareChannel } = useChannel()

const onSubmit = async () => {
  const schema = { ...formConfig.value.schema, errorMessage: { required: {}, properties: {} } }
  const { required, properties } = schema

  required.map((item) => {
    schema.errorMessage.required[item] = `${fieldsNameMapper[item]}不能为空`
  })

  for (let pKey in properties) {
    let msg = []
    if (properties[pKey].maxLength) {
      msg.push(`最大不能超过 ${properties[pKey].maxLength} 字符`)
    }

    if (properties[pKey].pattern) {
      msg.push(`格式不正确`)
    }

    schema.errorMessage.properties[pKey] = `${fieldsNameMapper[pKey]}${msg.join('，且')}`
  }

  const validate = ajv.compile(schema)
  const valid = validate(formState)

  try {
    submitting.value = true
    if (valid) {
      const saveParams = {
        form: internalId.value,
        sender_uid: route.query.uid || props.uid,
        channel: shareChannel.value,
        ...(formState as object)
      }
      await saveCustomerForm(saveParams)
      handlePostBytedancePromotion()
      emit('success')
      ElNotification.success('提交成功')
      resetFormState()
    } else {
      const allErrMsgArr = validate.errors.map((item) => item.message)
      ElMessage.error(allErrMsgArr.join('、'))
    }
  } catch (err) {
  } finally {
    submitting.value = false
  }
}

const handlePostBytedancePromotion = async () => {
  if (bytedancePromotionClickid.value) {
    try {
      await postBytedancePromotion(bytedancePromotionClickid.value, 'form')
    } catch (err) {
      console.log('Error in postBytedancePromotion:', err)
    }
  }
}
const onCancel = () => {
  emit('cancel')
  resetFormState()
}

const init = async () => {
  try {
    loading.value = true
    const {
      data: { data }
    } = await getCustomerFormConfig(internalId.value)
    formConfig.value = data

    data.fields.map((item) => {
      fieldsNameMapper[item.field_id] = item.name
    })
  } catch (err) {
  } finally {
    loading.value = false
  }
}

watch(
  internalId,
  (v) => {
    v && init()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.customer-form {
  :deep(.el-form-item__label) {
    color: #303133;
    font-weight: 500;
    line-height: 22px;
    font-size: 14px;
    margin-bottom: 8px;
  }
}
</style>
