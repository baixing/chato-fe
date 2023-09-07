<template>
  <div class="bg-[#F2F3F5] flex gap-4 h-full w-full overflow-hidden">
    <div class="bg-white flex-1 flex flex-col h-full overflow-hidden relative">
      <Topbar :center="false" class="px-20">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item>
            <a
              @click="onLinkBots"
              class="flex items-center !font-normal !text-[#909399] hover:!text-[#7c5cfc]"
            >
              <svg-icon svg-class="w-4 h-4 mr-1 mt-[-2px]" name="house" />
              我的 Bots
            </a>
          </el-breadcrumb-item>
          <el-breadcrumb-item>
            <span class="text-[#303133]">创建机器人</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </Topbar>
      <div class="px-20 pb-24 flex-1 overflow-y-auto">
        <h3 class="text-[#303133] font-medium text-xl mb-6">创建机器人</h3>
        <div class="inline-block p-4 bg-[#F2F3F5] rounded-lg mb-10">
          <p class="text-xs text-[#596780] leading-5 mb-3">
            通过以下两种方式之一，只要 20 秒即可快速填充基础信息
          </p>
          <div class="grid grid-cols-2 gap-5">
            <div v-for="item in createTypeSelectList" :key="item.icon" class="create-type-card">
              <svg-icon :name="item.icon" svg-class="w-8 h-8 text-[#7c5cfc]" />
              <div class="space-y-1">
                <p class="text-[#303133] text-sm font-medium tracking-[0.13px] transition-colors">
                  {{ item.name }}
                </p>
                <p class="text-[#9DA3AF] text-xs transition-colors">{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-4 items-center mb-8">
          <ImgUpload :value="formState.avatar" v-bind="uploadConfig" @onChange="onImgChange" />
          <HansInputLimit
            v-model:value="formState.name"
            type="text"
            size="default"
            :limit="HansLimit.name"
            class="flex-1"
          />
        </div>

        <div class="create-input-label">
          <SLTitle>角色设定</SLTitle>
          <AIGenerateBtn
            ref="AIGeneratePromptBtnRef"
            v-model:generateStr="formState.system_prompt"
            :type="EDomainAIGenerateType.role"
            @start="AIGenerateInputDisabled.system_prompt = true"
            @end="AIGenerateInputDisabled.system_prompt = false"
          />
        </div>
        <HansInputLimit
          v-model:value="formState.system_prompt"
          type="textarea"
          :rows="6"
          size="large"
          class="w-full mb-8"
        />

        <div class="create-input-label">
          <SLTitle>角色简介</SLTitle>
          <AIGenerateBtn
            ref="AIGenerateDescBtnRef"
            v-model:generateStr="formState.desc"
            :type="EDomainAIGenerateType.intro"
            @start="AIGenerateInputDisabled.desc = true"
            @end="AIGenerateInputDisabled.desc = false"
          />
        </div>
        <HansInputLimit
          v-model:value="formState.desc"
          type="textarea"
          :rows="6"
          size="large"
          class="w-full mb-8"
        />

        <div class="create-input-label">
          <SLTitle>欢迎语</SLTitle>
          <AIGenerateBtn
            ref="AIGenerateWelcomeBtnRef"
            v-model:generateStr="formState.welcome"
            :type="EDomainAIGenerateType.welcome"
            @start="AIGenerateInputDisabled.welcome = true"
            @end="AIGenerateInputDisabled.welcome = false"
          />
        </div>
        <HansInputLimit
          v-model:value="formState.welcome"
          type="textarea"
          :rows="6"
          size="large"
          class="w-full"
        />
      </div>
      <div
        class="px-20 py-4 box-border flex justify-end items-center gap-6 bg-white absolute z-[2] bottom-0 left-0 right-0"
        style="border-top: 1px solid #e4e7ed"
      >
        <el-button>存为草稿</el-button>
        <el-button type="primary">保存并创建</el-button>
      </div>
    </div>
    <div class="w-2/5 shrink-0 bg-white relative">
      <BotCreateChat :domain="formState" />
      <div
        v-if="!formState.name"
        class="absolute top-0 left-0 right-0 bottom-0 bg-[#00000033] text-white text-sm z-50 flex flex-col items-center justify-center gap-4"
      >
        <svg-icon name="lock" svg-class="w-8 h-8 text-white" />
        <p>完成角色设定即可预览调试</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DefaultAvatar from '@/assets/img/avatar.png'
import AIGenerateBtn from '@/components/AIGenerateBtn/index.vue'
import type { ImgUplaodProps } from '@/components/ImgUpload/data'
import ImgUpload from '@/components/ImgUpload/index.vue'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import SLTitle from '@/components/Title/SLTitle.vue'
import Topbar from '@/components/Topbar/index.vue'
import { currentEnvConfig } from '@/config'
import { EDomainAIGenerateType } from '@/enum/domain'
import type { IDomainInfo } from '@/interface/domain'
import { RoutesMap } from '@/router'
import * as url from '@/utils/url'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BotCreateChat from './components/BotCreateChat.vue'

const createTypeSelectList = [
  { icon: 'collection', name: '选择模版创建', desc: '海量模版助你快速创建' },
  { icon: 'robot-ai', name: 'AI一键创建', desc: 'AI生成，匹配度更高' }
]

const router = useRouter()

const onLinkBots = () => {
  router.push({ name: RoutesMap.manager.center })
}

const HansLimit = {
  name: 20,
  desc: 300,
  welcome: 500,
  brandName: 40,
  adText: 100
}
const formState = reactive<Partial<IDomainInfo>>({
  id: 0,
  slug: '',
  avatar: '',
  name: '',
  desc: '',
  system_prompt: '',
  welcome: ''
})
const AIGenerateInputDisabled = reactive({
  desc: false,
  system_prompt: false,
  welcome: false
})
const AIGenerateWelcomeBtnRef = ref()
const AIGenerateDescBtnRef = ref()
const AIGeneratePromptBtnRef = ref()

// AIGenerateWelcomeBtnRef.value?.resetCount()
//     AIGenerateIntroBtnRef.value?.resetCount()

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
  uploadBtnText: '', // 上传文案
  uploadBg: DefaultAvatar
} as ImgUplaodProps
const onImgChange = (value: any) => {
  formState.avatar = value ? value.url : ''
}
</script>

<style lang="scss" scoped>
.create-type-card {
  @apply flex-1 bg-white rounded-lg px-6 py-4 flex items-center gap-4 cursor-pointer;

  &:hover p:nth-of-type(1) {
    color: #7c5cfc;
  }
}

.create-input-label {
  @apply flex items-center justify-between mb-4;
}
</style>
