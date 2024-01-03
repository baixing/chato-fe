<template>
  <Modal v-model:visible="internalVisible" title="新建 Flow">
    <el-form
      ref="formRef"
      :model="formState"
      :rules="formRules"
      label-position="top"
      class="chato-form"
    >
      <el-form-item :label="$t('名称')" prop="name">
        <el-input v-model="formState.name" :placeholder="$t('请输入对话流名称')" />
      </el-form-item>
      <el-form-item :label="$t('简介')">
        <el-input
          v-model="formState.desc"
          type="textarea"
          :rows="6"
          :placeholder="$t('请输入对话流简介')"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span>
        <el-button plain @click="internalVisible = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="onSaveFlow">{{ $t('确认') }}</el-button>
      </span>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { addFlow } from '@/api/flow'
import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'success'])

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const { t } = useI18n()
const formRef = ref<FormInstance>()
const formRules = reactive<FormRules>({
  name: [{ required: true, message: t('对话流名称不能为空'), trigger: 'blur' }]
})
const formState = reactive({
  name: '',
  desc: ''
})

const resetFormState = () => {
  formState.desc = ''
  formState.name = ''
  nextTick(() => {
    formRef.value.resetFields()
    formRef.value.clearValidate()
  })
}

const onSaveFlow = async () => {
  try {
    await formRef.value.validate()
    await addFlow(formState)
    ElNotification.success(t('保存成功'))
    emit('success')
    internalVisible.value = false
  } catch (e) {}
}

watch(internalVisible, (v) => {
  v && resetFormState()
})
</script>
