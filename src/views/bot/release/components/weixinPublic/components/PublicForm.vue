<template>
  <el-form
    ref="ruleFormCreatePublicRef"
    size="large"
    label-position="top"
    :rules="rulesCreatePublic"
    :model="inputCreatePublicForm"
    :disabled="disabled"
    class="input-text-form border-0 ruleFormCreatePublicRef"
  >
    <el-form-item v-if="extraRequired" :label="extraName" prop="extra">
      <el-select
        class="w-full"
        @change="emit('handleSelect', inputCreatePublicForm.extra)"
        v-model="inputCreatePublicForm.extra"
        :placeholder="extraMessage"
      >
        <el-option
          v-for="item in extraList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="nameRequired" :label="$t(`群聊名称`)" prop="name">
      <HansInputLimit
        class="w-full"
        type="text"
        :placeholder="$t(`请输入群聊名称`)"
        v-model:value="inputCreatePublicForm.name"
        limit="32"
      />
    </el-form-item>
    <el-form-item v-if="weixinNameRequired" :label="$t(`激活时的微信昵称`)" prop="weixinName">
      <HansInputLimit
        class="w-full"
        type="text"
        :placeholder="$t(`请输入激活时的微信昵称`)"
        v-model:value="inputCreatePublicForm.weixinName"
        limit="32"
      />
      <p class="text-[#EA0000] !text-xs mt-[5px]">
        {{
          $t(
            '注意：请填写正确微信账号昵称。确认后，在群聊中用此微信账号输出 “激活”才可以在群中正常使用该机器人'
          )
        }}
      </p>
    </el-form-item>
    <el-collapse class="w-full !border-0 text-sm" v-if="hightRequired">
      <el-collapse-item :title="$t(`群高级设置`)" name="1" class="border-0 text-sm">
        <el-form-item :label="$t(`回复方式`)" prop="robot_response_type">
          <el-select
            v-model="inputCreatePublicForm.robot_response_type"
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
            v-model="inputCreatePublicForm.new_user_in_group_msg"
            :placeholder="$t(`请输入新人进群{'@'}Ta打招呼欢迎语`)"
          ></el-input>
        </el-form-item>
        <slot name="create"></slot>
      </el-collapse-item>
    </el-collapse>
    <el-form-item v-if="publicImgRequired" :label="$t(`上传群二维码`)" prop="base64_data">
      <ImgUpload
        @onChange="handleUpload"
        :value="inputCreatePublicForm.base64_data"
        v-bind="{ ...uploadProps }"
      />
    </el-form-item>
  </el-form>
  <slot
    name="default"
    :submit="inputCreatePublicForm"
    :ruleFormCreatePublicRef="ruleFormCreatePublicRef"
  ></slot>
</template>

<script setup lang="ts">
import type { ImgVideoUploadFile, MediaItem } from '@/components/ImgUpload/data'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import type { weixinCreateConfigType } from '@/interface/release'
import { getFileBase64 } from '@/utils/url'
import type { FormInstance, FormRules } from 'element-plus'
import { onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const emit = defineEmits(['handleSelect'])
const props = withDefaults(
  defineProps<{
    name?: string
    disabled?: boolean
    robot_response_type?: string
    new_user_in_group_msg?: string
    extraRequired?: boolean
    nameRequired?: boolean
    extraName?: string
    extraMessage?: string
    extraList?: any[]
    publicImgRequired?: boolean
    hightRequired?: boolean
    weixinNameRequired?: boolean
  }>(),
  {
    name: '',
    disabled: false,
    robot_response_type: '1',
    new_user_in_group_msg: '',
    nameRequired: true,
    extraRequired: false,
    publicImgRequired: false,
    hightRequired: true,
    weixinNameRequired: false
  }
)

const uploadProps = {
  uploadType: 1,
  cropProps: {
    aspectRatio: [1, 1], // 默认裁剪比例
    autoAspectRatio: true, // 是否允许修改裁剪比例
    notSelectCrop: true
  },
  showUploadList: {
    // 可操作按钮
    showCropIcon: true,
    showRemoveIcon: true,
    showPreviewIcon: true,
    showDownIco: true
  },
  uploadBtnText: '',
  maxLength: 1,
  itemWidth: 64,
  itemHeight: 64
}
const ruleFormCreatePublicRef = ref<FormInstance>()
const rulesCreatePublic = reactive<FormRules>({
  name: [
    {
      required: props.nameRequired,
      trigger: 'blur',
      message: t('请输入群聊名称')
    }
  ],
  robot_response_type: [{ required: true, trigger: 'blur', message: t('请选择回复方式') }],
  extra: [
    {
      required: props.extraRequired,
      trigger: 'blur',
      message: props.extraMessage
    }
  ],
  base64_data: [
    {
      required: props.publicImgRequired,
      trigger: 'change',
      message: t('请上传群二维码')
    }
  ],

  weixinName: [
    {
      required: props.weixinNameRequired,
      trigger: 'blur',
      message: t('请输入激活时的微信昵称')
    }
  ]

  // new_user_in_group_msg: [{ required: true, trigger: 'blur', message: '请输入新人进群@Ta打招呼' }]
})

const inputCreatePublicForm = reactive<weixinCreateConfigType>({
  name: '',
  robot_response_type: '',
  new_user_in_group_msg: '',
  robot_nickname: '',
  endpoint: '',
  extra: '',
  base64_data: '',
  weixinName: ''
})

const handleUpload = async (values: MediaItem, fileList: ImgVideoUploadFile[]) => {
  if (!fileList.length) return
  const selectedFile = fileList[0].raw
  try {
    const res = await getFileBase64(selectedFile)
    inputCreatePublicForm.base64_data = res as string
  } catch (e) {}
}

const watchProps = watch(
  props,
  (v) => {
    inputCreatePublicForm.name = v.name
    inputCreatePublicForm.robot_response_type = v.robot_response_type
    inputCreatePublicForm.new_user_in_group_msg = v.new_user_in_group_msg
  },
  { deep: true, immediate: true }
)

onUnmounted(() => {
  watchProps()
})
</script>
<style lang="scss" scoped>
.input-text-form {
  :deep(.el-collapse-item__header) {
    border-bottom: none;
  }
  :deep(.el-collapse-item__wrap) {
    border-bottom: none;
  }
}
.ruleFormCreatePublicRef {
  :deep(.el-collapse-item__arrow) {
    margin: 0 10px !important;
  }
}
</style>
