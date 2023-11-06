<template>
  <el-form
    ref="ruleFormCreateGroupRef"
    size="large"
    label-position="top"
    :rules="rulesCreateGroup"
    :model="inputCreateGroupForm"
  >
    <el-form-item v-if="nameRequired" :label="$t(`群聊名称`)" prop="name">
      <HansInputLimit
        class="w-full"
        type="text"
        :placeholder="$t(`请输入群聊名称`)"
        v-model:value="inputCreateGroupForm.name"
        limit="32"
      />
    </el-form-item>
    <el-form-item :label="$t('选择账号')" prop="custom_robot_wx_user_id">
      <el-select
        class="w-full"
        v-model="inputCreateGroupForm.custom_robot_wx_user_id"
        :placeholder="$t('请选择账号')"
      >
        <el-option
          v-for="item in accountListSelect"
          :key="item.wx_user_id"
          :label="item.name"
          :value="item.wx_user_id"
        />
      </el-select>
      <p class="flex justify-start items-center text-[#596780]">
        {{ $t('暂无账号？') }}
        <el-button type="primary" link @click="emit('handleCreateAccount')">
          {{ $t('去创建') }}
        </el-button>
      </p>
    </el-form-item>
    <el-collapse
      style="--el-collapse-border-color: transparent"
      class="w-full !border-0 text-sm group-collpase-container"
    >
      <el-collapse-item :title="$t(`群高级设置`)" name="1" class="border-0 text-sm">
        <el-form-item :label="$t(`回复方式`)" prop="robot_response_type">
          <el-select
            v-model="inputCreateGroupForm.robot_response_type"
            class="w-full"
            :placeholder="$t(`请选择回复方式`)"
          >
            <el-option :label="$t(`仅{'@'}回复`)" value="1" />
            <el-option :label="$t(`{'@'}或者提及昵称回复`)" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t(`新人进群{'@'}Ta打招呼`)" prop="new_user_in_group_msg">
          <el-input
            type="textarea"
            :rows="5"
            v-model="inputCreateGroupForm.new_user_msg"
            :placeholder="$t(`请输入新人进群{'@'}Ta打招呼欢迎语`)"
          />
        </el-form-item>
        <el-text class="!text-sm" type="info">
          {{ $t('如需修改机器人在群里的名字，请前往') }}
          <router-link :to="userRoute" class="theme-color">{{ $t('「形象」') }}</router-link>
          {{ $t('进行编辑机器人昵称，首位进群人员为管理员') }}
        </el-text>
      </el-collapse-item>
    </el-collapse>
  </el-form>
  <el-row class="w-full mt-2" justify="end" :gutter="20">
    <el-col :lg="4" :xl="4" :xs="12" :sm="12" :md="12">
      <el-button type="primary" size="large" @click="handleStep(ruleFormCreateGroupRef)">
        {{ $t('下一步') }}
      </el-button>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import type { IAccountList } from '@/interface/release'
import type { FormInstance, FormRules } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    userRoute: string
    nameRequired: boolean
    accountList: IAccountList[]
  }>(),
  {
    nameRequired: false
  }
)
const emit = defineEmits(['handleSubmit', 'handleCreateAccount'])

const { t } = useI18n()
const ruleFormCreateGroupRef = ref<FormInstance>()
const accountListSelect = computed(() => [...props.accountList])
const rulesCreateGroup = reactive<FormRules>({
  custom_robot_wx_user_id: [
    {
      required: true,
      trigger: 'blur',
      message: t('请选择账号')
    }
  ],
  name: [
    {
      required: props.nameRequired,
      trigger: 'blur',
      message: t('请输入群聊名称')
    }
  ],
  robot_response_type: [{ required: true, trigger: 'blur', message: t('请选择回复方式') }]
})

const inputCreateGroupForm = reactive({
  name: '',
  robot_response_type: '1',
  new_user_msg: '',
  custom_robot_wx_user_id: accountListSelect.value.length
    ? accountListSelect.value[0].wx_user_id
    : ''
})

const handleStep = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      emit('handleSubmit', inputCreateGroupForm)
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>
