<template>
  <Modal v-model:visible="internalVisible" title="绑定微信托管账户">
    <el-form
      ref="formRef"
      :model="formState"
      label-position="top"
      class="chato-form max-h-[55vh] overflow-scroll"
    >
      <el-form-item
        v-for="(item, index) in formState.wx_user_ids"
        :key="`wx_user_${index}`"
        :label="$t('托管账户') + ` ${index + 1}`"
        :prop="'wx_user_ids.' + index + '.value'"
        :rules="{
          required: true,
          message: $t('托管账户不能为空'),
          trigger: 'change'
        }"
      >
        <div class="flex items-center gap-2 w-full">
          <el-input v-model="item.value" :placeholder="$t('请输入')" />
          <el-icon
            :size="20"
            color="#7C5CFC"
            class="cursor-pointer transition-opacity hover:opacity-80"
            @click.prevent="onAddWxUser"
          >
            <CirclePlusFilled />
          </el-icon>
          <el-icon
            v-show="formState.wx_user_ids.length > 1"
            :size="18"
            color="#f56c6c"
            class="cursor-pointer transition-opacity hover:opacity-80"
            @click.prevent="onRemoveWxUser(item)"
          >
            <DeleteFilled />
          </el-icon>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span>
        <el-button plain @click="internalVisible = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="onSaveWxUserIds">{{ $t('确认') }}</el-button>
      </span>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { addFlowWxUsers, getFlowWxUsers } from '@/api/flow'
import type { IFlow } from '@/interface/flow'
import { ElNotification, type FormInstance } from 'element-plus'
import { cloneDeep } from 'lodash'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
  flowId: IFlow['id']
}>()

const emit = defineEmits(['update:visible'])

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})
const internalFlowId = computed(() => props.flowId)

const defaultFormState = {
  wx_user_ids: [
    {
      key: 1,
      value: ''
    }
  ]
}

const { t } = useI18n()
const formRef = ref<FormInstance>()
let formState = reactive({ ...defaultFormState })

const onRemoveWxUser = (item) => {
  const findIndex = formState.wx_user_ids.indexOf(item)
  if (findIndex !== -1) {
    formState.wx_user_ids.splice(findIndex, 1)
  }
}

const onAddWxUser = () => {
  formState.wx_user_ids.push({
    key: Date.now(),
    value: ''
  })
}

const resetFormState = (state = null) => {
  console.log()
  Object.assign(formState, state || cloneDeep(defaultFormState))
  nextTick(() => {
    if (!state) {
      formRef.value.resetFields()
    }
    formRef.value.clearValidate()
  })
}

const onSaveWxUserIds = async () => {
  try {
    await formRef.value.validate()
    const ids = formState.wx_user_ids.map((item) => item.value)
    await addFlowWxUsers(internalFlowId.value, ids)
    internalVisible.value = false
    ElNotification.success(t('保存成功'))
  } catch (e) {}
}

const initWxUserIds = async () => {
  try {
    const {
      data: { data }
    } = await getFlowWxUsers(internalFlowId.value)
    let settedState = null
    if (data.length) {
      const wx_user_ids = data.map((item, index) => {
        return {
          key: index,
          value: item
        }
      })
      settedState = { wx_user_ids }
    }
    resetFormState(settedState)
  } catch (e) {}
}

watch(internalVisible, (v) => {
  v ? initWxUserIds() : resetFormState()
})
</script>
