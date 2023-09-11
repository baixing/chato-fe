<template>
  <div class="relative overflow-hidden">
    <div
      v-if="initing"
      v-loading="true"
      element-loading-background="white"
      class="absolute top-0 left-0 right-0 bottom-0 z-[3]"
    ></div>
    <div v-else class="flex justify-between flex-wrap gap-4 w-full overflow-hidden">
      <div class="bot-setting-container max-w-[600px] 2xl:max-w-[480px]">
        <FLTitle>{{ $t('基本信息') }}</FLTitle>
        <div class="flex items-center justify-between gap-4 mb-9">
          <ImgUpload
            :value="settingForm.domain.avatar"
            @onChange="(v) => onImgChange(v, 'avatar')"
            v-bind="{ ...uploadConfig, uploadBg: DefaultAvatar }"
          />
          <div class="flex-1 -ml-[5px]">
            <HansInputLimit
              v-model:value="settingForm.domain.name"
              type="text"
              size="default"
              :limit="HansLimit.name"
              class="max-w-[300px] w-full mb-2"
            />
            <p class="text-[#9DA3AF] text-xs">ID: {{ domainInfo.slug }}</p>
          </div>
          <SwitchWithStateMsg v-model:value="settingForm.show.name_and_avatar_show" />
        </div>
        <el-form
          ref="form"
          :model="settingForm"
          label-width="auto"
          label-position="top"
          class="personal-form"
        >
          <el-form-item>
            <template #label>
              <div class="personal-label">
                <div class="flex items-center gap-2">
                  <span>{{ $t('简介') }}</span>
                  <AIGenerateBtn
                    ref="generateIntroBtnRef"
                    v-model:generateStr="settingForm.domain.desc"
                    :role="domainInfo.name"
                    :type="EDomainAIGenerateType.intro"
                    @start="descInputDisabled = true"
                    @end="descInputDisabled = false"
                  />
                </div>
                <SwitchWithStateMsg v-model:value="settingForm.show.desc_show" />
              </div>
            </template>
            <div class="flex items-center gap-6 w-full">
              <HansInputLimit
                v-model:value="settingForm.domain.desc"
                type="textarea"
                :rows="5"
                :limit="HansLimit.desc"
                :disabled="descInputDisabled"
                class="w-full"
              />
            </div>
          </el-form-item>
          <FLTitle class="mt-16">{{ $t('对话元素') }}</FLTitle>
          <el-form-item>
            <template #label>
              <div class="flex items-center justify-between">
                {{ $t('欢迎语') }}
                <AIGenerateBtn
                  ref="generateWelcomeBtnRef"
                  v-model:generateStr="settingForm.domain.welcome"
                  :role="domainInfo.name"
                  :type="EDomainAIGenerateType.welcome"
                  @start="welcomeInputDisabled = true"
                  @end="welcomeInputDisabled = false"
                />
              </div>
            </template>
            <div class="flex flex-col w-full">
              <HansInputLimit
                v-model:value="settingForm.domain.welcome"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 8 }"
                size="large"
                :limit="HansLimit.welcome"
                :disabled="welcomeInputDisabled"
              />
              <div class="personal-form-tips">
                {{
                  $t(
                    '打开聊天窗口后会主动发送，添加双井号可添加提问示例，例如：#帮我写一则关于xxx的文案#，此类消息不消耗电力值。'
                  )
                }}
              </div>
            </div>
          </el-form-item>
          <el-form-item :label="$t(`菜单栏`)" class="mt-10">
            <div class="w-full">
              <ChatShortcuts v-model:shortcuts="settingForm.shortcuts" :domain-id="domainId" />
              <div class="personal-form-tips">
                {{ $t('用户点击菜单后，将回复对应内容。此类消息不消耗电力值。') }}
              </div>
            </div>
          </el-form-item>
          <el-form-item :label="$t(`气泡设置`)" class="mt-10 !mb-16">
            <div class="flex gap-16 w-full lg:flex-col lg:gap-4">
              <div class="flex items-center gap-6">
                <span class="text-[#596780] bubble-text">{{ $t('对话气泡') }}</span>
                <ColorPicker v-model:color="settingForm.show.message_style" />
              </div>
              <div class="flex items-center gap-6">
                <span class="text-[#596780] bubble-text">{{ $t('悬浮气泡') }}</span>
                <ColorPicker v-model:color="settingForm.show.suspend_style" />
              </div>
            </div>
          </el-form-item>
          <div class="relative w-full">
            <FLTitle>{{ $t('品牌包装') }}</FLTitle>
            <el-form-item class="!mb-[60px]">
              <template #label>
                <div class="personal-label">
                  <span>{{ $t('品牌 & logo') }}</span>
                  <SwitchWithStateMsg v-model:value="settingForm.show.brand_show" />
                </div>
              </template>
              <div class="flex items-center justify-between gap-4 w-full">
                <ImgUpload
                  :value="settingForm.domain.brand_logo"
                  @onChange="(v) => onImgChange(v, 'brand_logo')"
                  v-bind="{
                    ...uploadConfig,
                    cropProps: { autoAspectRatio: false }
                  }"
                />
                <HansInputLimit
                  v-model:value="settingForm.domain.brand_name"
                  type="text"
                  size="large"
                  :limit="HansLimit.brandName"
                  class="w-full"
                />
              </div>
            </el-form-item>
            <SpaceRightsMask :visible="maskVisible" :rightsType="ESpaceRightsType.brand" />
          </div>
          <el-button type="primary" @click="onSave" size="large" class="lg:mb-4">{{
            $t('保存设定')
          }}</el-button>
        </el-form>
      </div>
      <div class="bot-setting-preview">
        <h2 class="preview-title">{{ $t('以下为预览效果') }}</h2>
        <PreviewBot
          :bot="previewBotInfo"
          :shortcuts="settingForm.shortcuts"
          :title-visible="settingForm.show.name_and_avatar_show"
          :desc-visible="settingForm.show.desc_show"
          :brand-visible="settingForm.show.brand_show"
        />
        <div
          class="bubble"
          :style="{
            backgroundColor: settingForm.show.suspend_style,
            color: svgIconColor
          }"
        >
          <el-icon>
            <ChatDotSquare />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { getDomainDetailV2, saveDomainV2 } from '@/api/domain'
import DefaultAvatar from '@/assets/img/avatar.png'
import AIGenerateBtn from '@/components/AIGenerateBtn/index.vue'
import ImgUpload from '@/components/ImgUpload/index.vue'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import SpaceRightsMask from '@/components/Space/SpaceRightsMask.vue'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import FLTitle from '@/components/Title/FLTitle.vue'
import { currentEnvConfig } from '@/config'
import { DefaultBrandLogo, DefaultBrandName } from '@/constant/brand'
import { ChatBubbleColorList } from '@/constant/chat'
import { EDomainAIGenerateType } from '@/enum/domain'
import { ESpaceRightsType } from '@/enum/space'
import { useChatStore } from '@/stores/chat'
import { useDomainStore } from '@/stores/domain'
import { useSpaceStore } from '@/stores/space'
import { $notnull, confirmAndSubmit } from '@/utils/help'
import { getStringWidth } from '@/utils/string'
import * as url from '@/utils/url'
import { ElLoading, ElMessage, ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { cloneDeep } from 'lodash-es'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import ChatShortcuts from './components/ChatShortcuts.vue'
import ColorPicker from './components/ColorPicker.vue'
import PreviewBot from './components/PreviewBot.vue'

const { t } = useI18n()
const route = useRoute()
const domainStoreI = useDomainStore()
const spaceStoreI = useSpaceStore()
const chatStoreI = useChatStore()
const loading = ref(null)
const initing = ref(false)
const welcomeInputDisabled = ref(false)
const descInputDisabled = ref(false)
const svgIconColor = computed(() => {
  const current = ChatBubbleColorList.find((item) => item.bg === settingForm.show.suspend_style)
  return current?.cl || '#fff'
})
const { domainInfo } = storeToRefs(domainStoreI)
const { currentRights } = storeToRefs(spaceStoreI)
const maskVisible = computed(() => !currentRights.value.brand)
const domainId = computed(() => String(domainInfo.value.id || route.params.botId || 0))
const slug = computed(() => domainInfo.value.slug)
const apiUpload = url.join(currentEnvConfig.uploadBaseURL, '/chato/api/file/upload/file')
const uploadConfig = {
  uploadType: 1, // 1: 直接上传; 2: 打开图库上传
  cropProps: {
    aspectRatio: [1, 1], // 默认裁剪比例
    autoAspectRatio: true // 是否允许修改裁剪比例
  },
  showUploadList: {
    // 可操作按钮
    showCropIcon: true,
    showRemoveIcon: true
  },
  maxLength: 1, // 限制上传数量
  apiUploadPath: apiUpload, // 上传路径
  itemWidth: 48,
  itemHeight: 48,
  uploadFillet: true, // 是否圆角
  uploadBtnText: '' // 上传文案
}
const HansLimit = {
  name: 20,
  desc: 300,
  welcome: 2000,
  brandName: 40,
  adText: 100
}
const settingForm = reactive({
  show: {
    name_and_avatar_show: false,
    desc_show: false,
    brand_show: false,
    ad_show: true,
    message_style: '#4C83F3',
    suspend_style: '#4C83F3'
  },
  shortcuts: [],
  domain: {
    avatar: 'https://file.baixing.net/202305/1628893905f1d24d8fe22c17a275557f.png',
    name: '',
    desc: '',
    welcome: '',
    brand_name: '',
    brand_logo: '',
    ad_content: t(
      'Chato ——基于AI技术 轻松创建对话机器人，赶快来 Chato 创建一个属于自己的机器人吧。'
    ),
    ad_frequency: 30,
    category: ''
  }
})
const previewBotInfo = computed(() => {
  return {
    ...domainInfo.value,
    ...settingForm.domain,
    message_style: settingForm.show.message_style
  }
})

const generateWelcomeBtnRef = ref()
const generateIntroBtnRef = ref()

const onImgChange = (value, type = 'avatar' | 'brand_logo') => {
  settingForm.domain[type] = value ? value.url : ''
}

const beforeSaveCheck = () => {
  let msg = ''
  if (getStringWidth(settingForm.domain.name) > HansLimit.name) {
    msg = t('机器人名字不能超过 {slot1} 字符', { slot1: HansLimit.name })
  }

  if (getStringWidth(settingForm.domain.desc) > HansLimit.desc) {
    msg = t('机器人简介不能超过 {slot1} 字符', { slot1: HansLimit.desc })
  }

  if (getStringWidth(settingForm.domain.welcome) > HansLimit.welcome) {
    msg = t('机器人欢迎语不能超过 {slot1} 字符', {
      slot1: HansLimit.welcome
    })
  }

  if (getStringWidth(settingForm.domain.brand_name) > HansLimit.brandName) {
    msg = t('品牌名称不能超过 {slot1} 字符', {
      slot1: HansLimit.brandName
    })
  }

  if (
    settingForm.show.ad_show &&
    getStringWidth(settingForm.domain.ad_content) > HansLimit.adText
  ) {
    msg = t('广告文案不能超过 {slot1} 字符', { slot1: HansLimit.adText })
  }

  if (msg) {
    ElMessage.warning(msg)
    return false
  }

  return true
}

const onSave = async () => {
  if (!beforeSaveCheck()) {
    return
  }
  loading.value = ElLoading.service({
    lock: true,
    text: t('保存中'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    // TODO: 推进后端接口改动，支持只传递要修改的字段，而不是全部的字段
    await saveDomainV2(slug.value, { ...domainDetailRes, ...settingForm })
    Notification.success(t('保存成功'))
    generateIntroBtnRef.value?.resetCount()
    generateWelcomeBtnRef.value?.resetCount()
    domainStoreI.initDomainList(route)
    chatStoreI.initChatList()
    settingFormInit = cloneDeep(toRaw(settingForm))
  } catch (e) {
  } finally {
    loading.value.close()
  }
}

let domainDetailRes = {}
let settingFormInit = {}

const getUserChat = async () => {
  initing.value = true

  try {
    const res = await getDomainDetailV2(slug.value)
    domainDetailRes = res.data.data
    const { show, shortcuts, domain } = domainDetailRes
    settingForm.domain = {
      ...settingForm.domain,
      ...domain,
      brand_logo: domain.brand_logo || DefaultBrandLogo,
      brand_name: domain.brand_name || DefaultBrandName
    }
    settingForm.show = $notnull(show) ? { ...settingForm.show, ...show } : settingForm.show
    settingForm.shortcuts = $notnull(shortcuts) ? shortcuts : settingForm.shortcuts
    settingFormInit = cloneDeep(toRaw(settingForm))
  } catch (e) {
  } finally {
    initing.value = false
  }
}

onBeforeRouteLeave((to, from, next) => {
  confirmAndSubmit(settingFormInit, { ...toRaw(settingForm) }, next, onSave)
})

watch(
  slug,
  (v) => {
    v && getUserChat()
  },
  { immediate: true }
)
</script>
<style>
.avatar-uploader .el-upload {
  position: relative;
  overflow: hidden;
  border-radius: 100%;
}

.avatar-uploader .el-upload:hover:after {
  content: '修改';
  display: flex;
  position: absolute;
  z-index: 9999;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
<style lang="scss" scoped>
.bubble-text {
  line-height: 1.55;
}
.bot-setting-container {
  width: 100%;

  :deep(.el-form-item__label) {
    font-size: 14px;
    color: #3d3d3d;
  }
}

.personal-form {
  .personal-label {
    @apply flex items-center justify-between text-[#303133];
  }

  .personal-se-label {
    @apply text-sm font-normal leading-4 tracking-[0.13px] text-[#596780] mb-4;
  }

  .personal-form-tips {
    @apply text-xs text-[#9DA3AF] mt-4 leading-4 font-normal;
  }

  :deep(.el-form-item__label) {
    padding: 0;
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.13px;
    margin-bottom: 16px !important;
  }
}

.bot-setting-preview {
  flex-shrink: 0;
  max-width: 375px;
  width: 100%;

  .preview-title {
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
  }

  .bubble {
    float: right;
    margin-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 44px;
    height: 44px;
    font-size: 24px;
    border-radius: 100%;
  }
}
</style>
