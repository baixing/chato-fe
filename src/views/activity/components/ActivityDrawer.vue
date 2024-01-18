<template>
  <el-drawer
    v-model="internalVisible"
    :title="$t(`创建活动`)"
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
      <el-form-item :label="$t('活动名称')" prop="name">
        <el-input v-model="formState.name" :placeholder="$t('请输入')" />
      </el-form-item>
      <el-form-item :label="$t('企微托管账户')" prop="additions.wx_user_id">
        <div class="flex items-end gap-2 w-full">
          <el-input
            v-model="formState.additions.wx_user_id"
            :placeholder="$t('请输入')"
            class="flex-1"
            @blur="onQwAccountBlur"
          />
          <el-button
            :disabled="!formState.additions.wx_user_id"
            :loading="tagLoading"
            plain
            @click="onLoadUserTags"
          >
            {{ $t('获取用户标签') }}
          </el-button>
        </div>
      </el-form-item>
      <div v-show="formState.additions.wx_user_id">
        <el-form-item :label="$t('推送用户标签')">
          <el-tree-select
            v-model="formState.additions.wx_tag_ids"
            :loading="tagLoading"
            :data="tags"
            multiple
            :render-after-expand="false"
            show-checkbox
            node-key="labelId"
            value-key="labelId"
            :placeholder="$t('不选择即默认全部标签')"
            :props="{ label: renderTagLable }"
            class="w-full"
          />
        </el-form-item>
        <el-form-item :label="$t('触发时间')" prop="send_time">
          <el-date-picker
            v-model="formState.send_time"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :placeholder="$t('请选择')"
          />
        </el-form-item>
        <el-form-item :label="$t('活动机器人')" prop="additions.domain_id">
          <el-select
            v-model="formState.additions.domain_id"
            clearable
            filterable
            fit-input-width
            :placeholder="$t('请选择')"
            class="w-full"
          >
            <el-option
              v-for="item in domainList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <div class="flex items-center gap-3 overflow-hidden">
                <Avatar :avatar="item.avatar || DefaultAvatar" :size="24" :name="item.name[0]" />
                <span class="truncate">{{ item.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <el-button plain @click="internalVisible = false" class="mr-3">{{ $t('取消') }}</el-button>
      <el-button :loading="submitting" type="primary" @click="onSubmit">{{ $t('确认') }}</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { addActivity, getQwUserTagList } from '@/api/activity'
import DefaultAvatar from '@/assets/img/avatar.png'
import { useBasicLayout } from '@/composables/useBasicLayout'
import type { IActivity, IQwUserTag } from '@/interface/activity'
import { useDomainStore } from '@/stores/domain'
import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'success'])

const { t } = useI18n()
const { isMobile } = useBasicLayout()
const domainStoreI = useDomainStore()
const { domainList } = storeToRefs(domainStoreI)

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const tagLoading = ref(false)
const tags = ref<IQwUserTag[]>([])

const onLoadUserTags = async () => {
  try {
    tagLoading.value = true
    tags.value = []
    const {
      data: { data }
    } = await getQwUserTagList(formState.additions.wx_user_id)
    tags.value = data
  } catch (e) {
  } finally {
    tagLoading.value = false
  }
}

const defaultFormState: Omit<IActivity, 'id'> = {
  name: '',
  additions: {
    wx_user_id: '',
    wx_tag_ids: [],
    domain_id: null
  },
  send_time: ''
}

const onQwAccountBlur = () => {
  if (!formState.additions.wx_user_id) {
    tags.value = []
    Object.assign(formState, {
      send_time: '',
      additions: { ...defaultFormState.additions }
    })
  }
}

const renderTagLable = (data: IQwUserTag, node: Node) => data.name

const formRef = ref<FormInstance>()
const formRules = reactive<FormRules>({
  name: [{ required: true, message: t('活动名称不能为空'), trigger: 'change' }],
  'additions.wx_user_id': [
    { required: true, message: t('企微托管账户不能为空'), trigger: 'change' }
  ],
  'additions.domain_id': [{ required: true, message: t('请选择机器人'), trigger: 'change' }],
  send_time: [{ type: 'date', required: true, message: t('触发时间不能为空'), trigger: 'change' }]
})
let formState = reactive({ ...defaultFormState })

const resetFormState = () => {
  Object.assign(formState, defaultFormState)
  nextTick(() => {
    formRef.value.resetFields()
    formRef.value.clearValidate()
  })
}

const submitting = ref(false)
const onSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    await addActivity({ ...formState, type: 1 })
    internalVisible.value = false
    ElNotification.success(t('操作成功'))
    emit('success')
  } catch (e) {
  } finally {
    submitting.value = false
  }
}

watch(internalVisible, (v) => {
  v && resetFormState()
})
</script>
