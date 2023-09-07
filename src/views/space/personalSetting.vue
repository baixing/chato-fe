<template>
  <Topbar :title="$t(`个人设置`)" />
  <div class="page-center-container page-content-cotainer">
    <el-form
      ref="settingFormRef"
      :model="settingForm"
      :rules="settingRule"
      size="large"
      align-items
      label-width="60px"
      :hide-required-asterisk="true"
    >
      <el-form-item :label="$t(` 手机号`)">
        {{ settingForm.mobile }}
      </el-form-item>
      <el-form-item :label="$t(`头像`)">
        <div class="img-upload-container">
          <div
            class="default-avatar"
            v-if="!settingForm.avatar && !isRemove"
            @click="handleReplace"
          >
            <el-avatar :size="48" class="bg-[#7C5CFC]">{{ userInfo.nickname[0] }}</el-avatar>
          </div>
          <div
            :class="[!settingForm.avatar && !isRemove ? 'hidden-img-upload' : 'show-img-upload']"
          >
            <ImgUpload v-bind="uploadConfig" :value="settingForm.avatar" @onChange="handleChange" />
          </div>
        </div>
      </el-form-item>
      <el-form-item :label="$t(`昵称`)" prop="nickname">
        <HansInputLimit
          v-model:value="settingForm.nickname"
          type="text"
          size="large"
          :placeholder="$t(`请输入你的昵称`)"
          :limit="20"
          class="w-full max-w-[330px]"
        />
      </el-form-item>
      <el-form-item label-width="12px" class="mt-[56px]">
        <el-row class="w-full">
          <el-col :xs="8" :sm="6" :md="4" :lg="4" :xl="4"
            ><el-button type="primary" @click="handleSaveSetting(settingFormRef)">{{
              $t('保存设置')
            }}</el-button></el-col
          >
        </el-row>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import { updateOrgUserInfo } from '@/api/space'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import Topbar from '@/components/Topbar/index.vue'
import { useBase } from '@/stores/base'
import { getStringWidth } from '@/utils/string'
import type { FormInstance, FormRules } from 'element-plus'
import { ElLoading, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const base = useBase()
const { userInfo } = storeToRefs(base)
const settingFormRef = ref<FormInstance>()

const settingForm = reactive<{
  mobile: string
  nickname: string
  avatar?: string
}>({
  mobile: null,
  avatar: '',
  nickname: ''
})
const settingRule = reactive<FormRules>({
  nickname: [
    {
      required: true,
      message: t('请输入你的昵称'),
      trigger: 'blur'
    }
  ]
})
const isRemove = ref<boolean>(false)

const uploadConfig = {
  uploadType: 1, // 1: 直接上传; 2: 打开图库上传
  cropProps: {
    aspectRatio: [1, 1], // 默认裁剪比例
    autoAspectRatio: true, // 是否允许修改裁剪比例
    notSelectCrop: false
  },
  showUploadList: {
    // 可操作按钮
    showCropIcon: true,
    showPreviewIcon: true,
    showRemoveIcon: true,
    showDownloadIcon: true
  },
  maxLength: 1, // 限制上传数量
  itemWidth: 48,
  itemHeight: 48,
  uploadFillet: true
}
const handleReplace = () => {
  isRemove.value = true
}

const handleChange = (value: any) => {
  settingForm.avatar = value.url
}

const handleSaveSetting = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      if (getStringWidth(settingForm.nickname) > 20)
        return Notification.error(t('昵称超过20个字符'))
      if (getStringWidth(settingForm.nickname) === 0) return Notification.error(t('请输入昵称'))
      settingForm.nickname = settingForm.nickname.trim()
      const loading = ElLoading.service({
        lock: true,
        text: t('保存中'),
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const data = {
        avatar: settingForm.avatar,
        nickname: settingForm.nickname
      }
      try {
        await updateOrgUserInfo(data)
        base.updateUserInfoAttri(data)
        Notification.success(t('保存成功'))
      } catch (e) {
      } finally {
        loading.close()
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

const watchUserInfo = watch(
  userInfo,
  (v) => {
    settingForm.mobile = v.mobile
    settingForm.avatar = v.avatar
    settingForm.nickname = v.nickname
  },
  { immediate: true, deep: true }
)

onUnmounted(() => {
  watchUserInfo()
})
</script>
<style lang="scss" scoped>
.default-avatar {
  position: absolute;
  width: 48px;
  height: 48px;
  font-size: 14px;
  &:hover {
    &::after {
      content: '替换';
      width: 48px;
      height: 48px;
      line-height: 48px;
    }
  }
}

.img-upload-container {
  position: relative;
  width: 48px;
  height: 48px;
  .hidden-img-upload {
    opacity: 0;
    height: 100%;
  }
  .show-img-upload {
    opacity: 1;
    height: 100%;
  }
}
</style>
