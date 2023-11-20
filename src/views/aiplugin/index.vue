<template>
  <div class="overflow-y-auto h-full">
    <Topbar :title="t('插件库')" class="!mb-0 lg:!mb-4" />
    <ContentLayout class="!overflow-hidden !h-auto pt-8 lg:pt-0">
      <el-card class="box-card flex flex-col">
        <div class="flex items-start p-4 border-b">
          <img :src="XHSLogo" alt="" class="w-[67px] h-[24px]" />
          <div class="flex flex-col justify-between ml-5 w-full">
            <h3 class="font-semibold text-lg" style="color: #3d3d3d">小红书智能评论插件</h3>
            <div class="flex flex-row space-x-4 justify-between w-full">
              <p class="text-sm mt-2" style="color: #9da3af">3234人使用</p>
              <div class="flex items-center text-yellow-500 mt-2" style="color: #ffcd45">
                <p class="text-sm">评分4.0分</p>
                <div class="flex ml-2">
                  <span
                    v-bind:key="n"
                    class="cursor-pointer"
                    v-for="n in 5"
                    :class="{ 'text-gray-300': n > 4 }"
                    >&#9733;</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 flex-1 space-y-4 w-full">
          <p class="text-sm text-gray-600">
            帮助商家和创作者在小红书平台进行社交营销的神器。它能基于用户设置的主题和需求,自动生成相关的评论内容,实现在小红书上的精准获客。
          </p>
          <el-button
            style="background: #7c5cfc; border-radius: 4px; color: #ffffff"
            class="w-full"
            @click="installDialogVisible = true"
            >添加</el-button
          >
          <el-button
            style="background: #7c5cfc; border-radius: 4px; color: #ffffff"
            class="w-full"
            @click="navigateToNextPage"
            >使用</el-button
          >
        </div>
      </el-card>
    </ContentLayout>
    <el-dialog v-model="installDialogVisible" title="安装小红书插件步骤">
      <div class="steps-container">
        <div class="step-item" v-for="(step, index) in steps" :key="index">
          <p class="font-bold mt-5" v-html="step.description"></p>
          <img v-if="step.image" :src="step.image" alt="步骤图片" />
          <el-button class="mt-5" v-if="step.buttonText" type="primary" @click="step.action">{{
            step.buttonText
          }}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style>
.box-card {
  width: 480px;
}

.steps-container {
  text-align: center;
}
.step-item {
  margin-bottom: 20px;
}
.step-item img {
  margin: 10px 0;
  max-width: 100%;
  height: auto;
}
</style>

<script lang="ts" setup>
import XHSLogo from '@/assets/img/xhs-logo.png'
import ContentLayout from '@/layout/ContentLayout.vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { RoutesMap } from '../../router'

const { t } = useI18n()
const router = useRouter()

const installDialogVisible = ref(false)
const route = useRoute()
const downloadPlugin = () => {
  // Implement the logic to download the plugin file
  const link = document.createElement('a')
  link.href = 'https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato-xhs.zip'
  link.download = 'dist.zip' // Optional: you can set the default filename for the download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
const steps = ref([
  {
    description: '第一步 下载插件, 解压文件',
    image: '',
    buttonText: '下载本地文件',
    action: downloadPlugin
  },
  {
    description: '第二步 打开Chrome浏览器 输入 chrome://extensions/',
    image: 'https://cdn.jsdelivr.net/gh/XmchxUp/cloudimg@master/20231111/image.6v1vjscf7jk0.png',
    buttonText: '',
    action: null
  },
  {
    description:
      '第三步 点击 加载已解压的扩展程序(若无显示，则打开左上角的开发者模式), 选中刚刚下载解压后的文件夹',
    image: 'https://cdn.jsdelivr.net/gh/XmchxUp/cloudimg@master/20231111/image.38iz6eviup80.webp',
    buttonText: '',
    action: null
  },
  {
    description: '第四步 安装好后，刷新Chato界面即可使用, 网页端登陆小红书',
    image: '',
    buttonText: '',
    action: null
  }
])

watch(installDialogVisible, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    location.reload()
  }
})

function navigateToNextPage() {
  router.replace({ name: RoutesMap.aiPlugin.detail, params: { name: 'xhs' } })
  // router.push('/aiplugin/detail/xhs')
}
</script>
