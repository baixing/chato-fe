<template>
  <Topbar :title="$t(`个人设置`)" />
  <div class="page-center-container page-content-container">
    <SLTitle class="!text-base">{{ t('你的账户') }}</SLTitle>
    <el-form
      ref="settingFormRef"
      :model="settingForm"
      :rules="settingRule"
      label-width="auto"
      label-position="left"
      :hide-required-asterisk="true"
      class="chato-form setting-form"
    >
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
            v-else
            :class="[!settingForm.avatar && !isRemove ? 'hidden-img-upload' : 'show-img-upload']"
          >
            <ImgUpload
              :setInitUrl="handleChange"
              :initImgUrl="''"
              :fixed="true"
              :imgUrl="settingForm.avatar"
            />
          </div>
        </div>
      </el-form-item>
      <el-form-item :label="$t(`昵称`)" prop="nickname">
        <HansInputLimit
          v-model:value="settingForm.nickname"
          type="text"
          :placeholder="$t(`请输入你的昵称`)"
          :limit="20"
          class="w-full max-w-[330px]"
        />
      </el-form-item>
      <el-form-item :label="$t(`手机号`)">
        {{ settingForm.mobile }}
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSaveSetting(settingFormRef)">
          {{ $t('保存设置') }}
        </el-button>
      </el-form-item>
    </el-form>
    <el-divider class="!my-10" style="--el-border-color: #e4e7ed" />
    <div class="flex items-center gap-3">
      <SLTitle class="!text-base">{{ t('注销账户') }}</SLTitle>
      <el-button link style="--el-button-text-color: #596780" @click="onLogoutAccount">{{
        t('去注销')
      }}</el-button>
    </div>
    <p class="text-sm leading-[18px] tracking-[0.13px] text-[#9DA3AF] mt-4">
      {{ t('注销之后，所有数据将被清空，请谨慎操作') }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import { logoutAccount } from '@/api/auth'
import { updateOrgUserInfo } from '@/api/space'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import SLTitle from '@/components/Title/SLTitle.vue'
import ImgUpload from '@/components/NewImgUpload/ImgUpload.vue'
import Topbar from '@/components/Topbar/index.vue'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { confirmAndSubmit } from '@/utils/help'
import { getStringWidth } from '@/utils/string'
import type { FormInstance, FormRules } from 'element-plus'
import { ElLoading, ElMessageBox, ElNotification as Notification } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { reactive, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const base = useBase()
const authStoreI = useAuthStore()
const { userInfo } = storeToRefs(base)
const settingFormRef = ref<FormInstance>()
let settingFormInit = {}

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

const handleReplace = () => {
  isRemove.value = true
}

const handleChange = (value: string) => (settingForm.avatar = value || '')

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

const onLogoutAccount = async () => {
  try {
    await ElMessageBox.confirm(
      t(
        '注销账户是不可恢复的操作，请谨慎操作。帐户成功注销后，你将无法登录、使用该帐户的资产、权益、记录等一切内容，无法继续使用且无法恢复。'
      ),
      t('注销账户：{account}', { account: settingForm.mobile }),
      {
        confirmButtonText: t('确认'),
        cancelButtonText: t('取消'),
        type: 'warning'
      }
    )
    await logoutAccount()
    authStoreI.logout()
    router.push('/')
  } catch (err) {}
}

onBeforeRouteLeave((to, from, next) => {
  confirmAndSubmit(settingFormInit, { ...toRaw(settingForm) }, next, () =>
    handleSaveSetting(settingFormRef.value)
  )
})

watch(
  userInfo,
  (v) => {
    settingForm.mobile = v.mobile
    settingForm.avatar = v.avatar
    settingForm.nickname = v.nickname
    settingFormInit = cloneDeep(toRaw(settingForm))
  },
  { immediate: true, deep: true }
)
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

.setting-form {
  margin-top: 24px;

  :deep(.el-form-item__label) {
    margin-bottom: 0px !important;
    align-items: center;
    height: 100%;
    min-width: 62px;
  }
}
</style>
