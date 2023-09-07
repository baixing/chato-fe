<template>
  <PublicForm v-bind="initPublicConfig" @handleSelect="handleSelect">
    <template #create>
      <el-text class="group-tips !text-sm" type="info"
        >{{ $t('如需修改机器人在群里的名字，请前往')
        }}<router-link :to="userRoute" class="theme-color">{{ $t('「形象」') }}</router-link
        >{{ $t('进行编辑机器人昵称') }}</el-text
      >
    </template>
    <template #default="defaultProps">
      <el-row class="w-full mt-2" justify="end" :gutter="20">
        <el-col :lg="4" :xl="4" :xs="12" :sm="12" :md="12" v-if="inviteNumberMeasure">
          <el-button size="large" @click="emit('handleCancel')">{{ $t('取消') }}</el-button>
        </el-col>
        <el-col
          :lg="inviteNumberMeasure ? 4 : 6"
          :xl="inviteNumberMeasure ? 4 : 6"
          :xs="12"
          :sm="12"
          :md="12"
        >
          <el-button
            type="primary"
            size="large"
            @click="
              () =>
                emit(
                  'submitCreatePublic',
                  defaultProps.submit,
                  defaultProps.ruleFormCreatePublicRef,
                  inviteNumberMeasure ? ECreatePublicType.invite : ECreatePublicType.friends
                )
            "
          >
            {{ inviteNumberMeasure ? $t('确认') : $t('添加机器人为好友') }}
          </el-button>
        </el-col>
      </el-row>
    </template>
  </PublicForm>
</template>
<script lang="ts" setup>
import { ECreatePublicType } from '@/enum/release'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PublicForm from './PublicForm.vue'
const { t } = useI18n()
const emit = defineEmits(['handleCancel', 'handleCopyApiUrl', 'submitCreatePublic'])

defineProps<{
  userRoute: string
}>()

const initPublicConfig = reactive({
  nameRequired: true,
  extraRequired: true,
  publicImgRequired: true,
  hightRequired: true,
  extraName: t('群成员数'),
  extraMessage: t('请选择群成员数'),
  weixinNameRequired: true,
  extraList: [
    { value: '100', label: t('小于200人') },
    { value: '200', label: t('大于200人') }
  ]
})

const inviteNumberMeasure = ref(true) // 默认群聊人数 < 100

const handleSelect = (e: string) => {
  initPublicConfig.publicImgRequired = e === '100'
  inviteNumberMeasure.value = e === '100'
}
</script>
