<template>
  <el-drawer
    v-model="internalVisible"
    :title="$t(`添加意图`)"
    :size="isMobile ? '80%' : '40%'"
    class="chato-drawer"
  >
    <el-form
      ref="formRef"
      :model="formState"
      :rules="formRules"
      label-position="top"
      class="chato-form"
    >
      <el-form-item :label="$t('意图名称')" prop="name">
        <el-input
          v-model="formState.name"
          :placeholder="$t('请输入')"
          show-word-limit
          maxlength="100"
        />
      </el-form-item>
      <el-form-item :label="$t('意图命中场景')" prop="node_prompt">
        <el-input
          v-model="formState.node_prompt"
          type="textarea"
          show-word-limit
          maxlength="100"
          :rows="3"
          :placeholder="
            $t('例如：客户询问了与活动相关的问题关键词有：参加、报名、交钱、缴费、活动、转发等')
          "
        />
      </el-form-item>
      <el-form-item :label="$t('意图关联机器人')" prop="domain_id">
        <el-select
          v-model="formState.domain_id"
          clearable
          filterable
          fit-input-width
          :placeholder="$t('意图命中后将优先使用该机器人进行回复')"
          class="w-full"
        >
          <el-option v-for="item in domainList" :key="item.id" :label="item.name" :value="item.id">
            <div class="flex items-center gap-3 overflow-hidden">
              <Avatar :avatar="item.avatar || DefaultAvatar" :size="24" :name="item.name[0]" />
              <span class="truncate">{{ item.name }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button plain @click="internalVisible = false" class="mr-3">{{ $t('取消') }}</el-button>
      <el-button type="primary" @click="onSubmit">{{ $t('确认') }}</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { addIntention } from '@/api/flow'
import DefaultAvatar from '@/assets/img/avatar.png'
import { useBasicLayout } from '@/composables/useBasicLayout'
import type { IIntention } from '@/interface/flow'
import { useDomainStore } from '@/stores/domain'
import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'success'])

const { t } = useI18n()
const route = useRoute()
const { isMobile } = useBasicLayout()
const domainStoreI = useDomainStore()
const { domainList } = storeToRefs(domainStoreI)

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const defaultFormState: Pick<IIntention, 'domain_id' | 'node_prompt' | 'name'> = {
  name: '',
  node_prompt: '',
  domain_id: null
}

const formRef = ref<FormInstance>()
const formRules = reactive<FormRules>({
  name: [{ required: true, message: t('意图名称不能为空'), trigger: 'change' }],
  node_prompt: [{ required: true, message: t('意图命中场景不能为空'), trigger: 'change' }],
  domain_id: [{ required: true, message: t('请选择意图关联机器人'), trigger: 'change' }]
})
let formState = reactive({ ...defaultFormState })

const resetFormState = () => {
  Object.assign(formState, defaultFormState)
  nextTick(() => {
    formRef.value.resetFields()
    formRef.value.clearValidate()
  })
}

const onSubmit = async () => {
  try {
    await formRef.value.validate()
    const params = {
      ...formState,
      parent_node_id: 0,
      sop_flow_id: route.params.flowId
    }
    await addIntention(params)
    internalVisible.value = false
    ElNotification.success(t('操作成功'))
    emit('success')
  } catch (e) {}
}

watch(internalVisible, (v) => {
  v && resetFormState()
})
</script>
