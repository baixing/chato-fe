<template>
  <el-button
    v-if="!formState.id"
    plain
    class="!text-[#7c5cfc] !border-[#7c5cfc] !font-normal hover:opacity-80"
    @click="onOpenDialog()"
  >
    {{ $t('添加收集表单') }}
  </el-button>
  <div v-else class="p-3 bg-[#F2F3F5] rounded-lg flex justify-between gap-6">
    <div class="text-[#303133] text-xs flex items-center flex-1 overflow-hidden">
      <span
        class="inline-flex w-5 h-5 bg-white rounded-md mr-2 items-center justify-center shrink-0"
      >
        <svg-icon name="table-form" svg-class="w-[14px] h-[14px]"></svg-icon>
      </span>
      <span class="mr-2 truncate">{{ $t('表单：{slot1}', { slot1: formTitle }) }}</span>

      <span class="inline-flex gap-2 shrink-0">
        <el-button link type="primary" size="small" @click="onOpenDialog(formState.id)">
          {{ $t('编辑') }}
        </el-button>
        <el-button link type="primary" size="small" @click="onPreview">{{ $t('预览') }}</el-button>
        <el-button link type="danger" size="small" @click="onDelete">{{ $t('删除') }}</el-button>
      </span>
    </div>
    <SwitchWithStateMsg
      :value="formAbled"
      :close-msg="$t('关闭')"
      :open-msg="$t('开启')"
      msg-position="left"
      size="small"
      @change="onFormAbled"
    />
  </div>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('收集表单')"
    :width="isMobile ? '80%' : '40%'"
    @close="onCloseDialog"
  >
    <el-form ref="formRef" label-position="top" :model="formState" class="collect-form">
      <el-form-item :label="$t('表单标题')" prop="title" required :rules="formRules.title">
        <el-input
          v-model="formState.title"
          :placeholder="$t('标题将展示在广告内，用户可点击后展开表单')"
        />
      </el-form-item>
      <div class="mb-3 text-[#303133]">{{ $t('表单条目') }}</div>
      <el-row :gutter="8" class="mb-3 text-[#596780]">
        <el-col :span="6">{{ $t('类型') }}</el-col>
        <el-col :span="11">{{ $t('问题') }}</el-col>
        <el-col :span="3">{{ $t('必填') }}</el-col>
        <el-col :span="4">{{ $t('操作') }}</el-col>
      </el-row>
      <draggable
        tag="ul"
        v-model="formState.fields"
        group="fields"
        handle=".handle"
        item-key="sort"
        @start="drag = true"
        @end="drag = false"
      >
        <template #item="{ element, index }">
          <el-row :gutter="12" :key="`fields_${index}`">
            <el-col :span="6">
              <el-form-item :prop="`fields.${index}.type`" :rules="formRules.fieldType">
                <el-select
                  v-model="element.type"
                  :placeholder="$t('请选择表单类型')"
                  :options="CustomerFormFieldTypeOptions"
                >
                  <el-option
                    v-for="item in CustomerFormFieldTypeOptions"
                    :key="item.value"
                    :label="$t(item.label)"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item :prop="`fields.${index}.name`" :rules="formRules.fieldName">
                <el-input v-model="element.name" :placeholder="$t('请输入问题')" />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item :prop="`fields.${index}.required`">
                <el-checkbox v-model="element.required" />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <span class="flex items-center gap-3 h-8">
                <el-button
                  v-show="formState.fields.length !== 1"
                  :icon="Delete"
                  type="danger"
                  link
                  class="!w-fit"
                  @click="onRemoveFormField(index)"
                />
                <svg-icon
                  name="dragger"
                  svg-class="w-4 h-4 text-[#303133] cursor-move hover:opacity-80"
                  class="handle"
                ></svg-icon>
              </span>
            </el-col>
          </el-row>
        </template>
      </draggable>
      <el-button v-show="formState.fields.length !== 5" link type="primary" @click="onAddFormField">
        {{ $t('新增一项') }}
      </el-button>
    </el-form>
    <template #footer>
      <span>
        <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="onSubmit">{{ $t('确认') }}</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog
    v-model="previewVisible"
    :title="$t('预览表单')"
    :width="isMobile ? '80%' : '40%'"
    class="preview-dialog"
  >
    <div class="p-4 bg-white rounded">
      <p class="text-[#303133] font-medium leading-7 text-base mb-4">{{ $t('留下联系方式') }}</p>
      <CustomerForm :id="formState.id" disabled />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  getLatestCustomerFormConfig,
  saveCustomerFormConfig,
  updateCustomerFormConfigStatus
} from '@/api/customerForm'
import CustomerForm from '@/components/Customer/CustomerForm.vue'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { CustomerFormFieldTypeOptions } from '@/constant/customerForm'
import { ECustomerFormFieldType } from '@/enum/customerForm'
import type { ICustomerFormConfig, ICustomerFormField } from '@/interface/customerForm'
import { useDomainStore } from '@/stores/domain'
import { Delete } from '@element-plus/icons-vue'
import { ElMessageBox, type FormInstance } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import remove from 'lodash-es/remove'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import draggable from 'vuedraggable'

const { t } = useI18n()
const dialogVisible = ref(false)
const previewVisible = ref(false)
const drag = ref(false)

const { isMobile } = useBasicLayout()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const domainSlug = computed(() => domainInfo.value.slug)

const defaultFormField: ICustomerFormField = {
  name: '',
  type: ECustomerFormFieldType.string,
  required: false,
  sort: 0
}

const formRef = ref<FormInstance>()
const formTitle = ref('')
let formState = reactive<ICustomerFormConfig>({
  title: '',
  domain_id: domainInfo.value.id,
  disabled: 0,
  fields: []
})

const formAbled = computed({
  get: () => !formState.disabled,
  set: (v) => (formState.disabled = Number(!v))
})

let originalConfigState: ICustomerFormConfig

const formRules = {
  title: [
    { required: true, message: t('表单标题不能为空'), trigger: 'change' },
    { max: 40, message: t('表单标题最大不能超过 40 字符'), trigger: 'change' }
  ],
  fieldType: { required: true, message: t('类型不能为空'), trigger: 'change' },
  fieldName: [
    { required: true, message: t('问题不能为空'), trigger: 'change' },
    { max: 20, message: t('问题最大不能超过 20 字符'), trigger: 'change' }
  ]
}

const onUpdateAbleAdForm = async () => {
  if (!formState.id) {
    return
  }
  await updateCustomerFormConfigStatus({
    id: formState.id,
    disabled: Number(!formAbled.value)
  })
}

const onFormAbled = async (value) => {
  try {
    const confirmAction = value ? '开启' : '关闭'
    const showHide = value ? t('') : t('不')
    await ElMessageBox.confirm(
      t('{slot1}表单后，广告中将{slot2}会展示表单，是否确认{slot3}表单？', {
        slot1: confirmAction,
        slot2: showHide,
        slot3: confirmAction
      }),
      t(`{slot1}表单`, { slot1: confirmAction }),
      {
        confirmButtonText: t('确认'),
        cancelButtonText: t('取消')
      }
    )
    formAbled.value = value
  } catch (err) {}
}

const onAddFormField = () => {
  formState.fields.push({ ...defaultFormField, sort: formState.fields.length })
}

const onRemoveFormField = (rIndex: number) => {
  remove(formState.fields, (item, index) => index === rIndex)
}

const onOpenDialog = async (formId?: number) => {
  formRef.value?.clearValidate()
  if (formId && originalConfigState) {
    formState.fields = cloneDeep(originalConfigState.fields)
    formState.title = originalConfigState.title
  } else {
    formState.title = ''
    formState.fields = []
    onAddFormField()
  }

  dialogVisible.value = true
}

const onCloseDialog = () => {
  formRef.value.clearValidate()
  dialogVisible.value = false
}

const onSubmit = async () => {
  try {
    await formRef.value.validate()

    const confirmState = {
      action: t('创建'),
      tips: t('创建的表单将加在广告末尾，提交的信息可在表单报表明细中查看，是否确认创建？')
    }
    if (formState.id) {
      confirmState.action = t('修改')
      confirmState.tips = t('修改后将更新表单，该操作不可撤销，是否确认修改？')
    }

    await ElMessageBox.confirm(confirmState.tips, `${confirmState.action}表单`, {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消')
    })

    const saveState = { ...toRaw(formState), domain_id: domainInfo.value.id }

    const {
      data: { data }
    } = await saveCustomerFormConfig(saveState)
    originalConfigState = data
    formTitle.value = data.title
    formState.id = data.id
    dialogVisible.value = false
  } catch (err) {}
}

const onDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('删除后该表单收集到的数据明细也会对应删除，该操作不可撤销，是否确认删除表单？'),
      t(`删除表单`),
      {
        confirmButtonText: t('确认'),
        cancelButtonText: t('取消')
      }
    )

    await updateCustomerFormConfigStatus({
      id: formState.id,
      status: 0
    })

    resetFormState()
  } catch (e) {}
}

const resetFormState = () => {
  originalConfigState = undefined
  formState.id = undefined
  formState.fields = []
  formState.title = ''
  formState.disabled = 0
}

const onPreview = () => {
  previewVisible.value = true
}

const init = async () => {
  try {
    const {
      data: { data }
    } = await getLatestCustomerFormConfig(domainInfo.value.id)

    if (data) {
      formState = Object.assign(formState, data)
      originalConfigState = cloneDeep(data)
      formTitle.value = data.title
    } else {
      resetFormState()
    }
  } catch (err) {}
}

watch(domainSlug, (v) => v && init(), { immediate: true })

defineExpose({
  onUpdateAbleAdForm
})
</script>

<style lang="scss" scoped>
.collect-form {
  :deep(.el-form-item__label) {
    color: #303133;
  }
}
</style>

<style lang="scss">
.preview-dialog {
  background-color: #f2f3f5;

  .el-dialog__headerbtn .el-dialog__close {
    color: #303133;
  }

  .el-dialog__body {
    padding: 4px 24px 24px;
  }
}
</style>
