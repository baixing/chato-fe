<template>
  <PublicForm>
    <template #create>
      <el-text class="group-tips !text-sm mb-[5px]" type="info"
        >{{ $t('如需修改机器人在群里的名字，请前往')
        }}<router-link :to="userRoute" class="theme-color">{{ $t('「形象」') }}</router-link
        >{{ $t('进行编辑机器人昵称') }}</el-text
      >
      <el-text class="group-tips !text-sm" type="info">{{ $t(' 首位进群人员为管理员 ') }}</el-text>
    </template>
    <template #default="defaultProps">
      <el-row class="w-full mt-2" justify="end" :gutter="20">
        <el-col :lg="4" :xl="4" :xs="12" :sm="12" :md="12">
          <el-button size="large" @click="emit('handleCancel')">{{ $t('取消') }}</el-button>
        </el-col>
        <el-col :lg="4" :xl="4" :xs="12" :sm="12" :md="12">
          <el-button
            type="primary"
            size="large"
            @click="
              () =>
                emit(
                  'submitCreatePublic',
                  defaultProps.submit,
                  defaultProps.ruleFormCreatePublicRef,
                  ECreatePublicType.create
                )
            "
            >{{ $t('确认') }}</el-button
          >
        </el-col>
      </el-row>
    </template>
  </PublicForm>
</template>
<script lang="ts" setup>
import { ECreatePublicType } from '@/enum/release'
import PublicForm from './PublicForm.vue'

const emit = defineEmits(['handleCancel', 'handleCopyApiUrl', 'submitCreatePublic'])
defineProps<{
  userRoute: string
}>()
</script>
