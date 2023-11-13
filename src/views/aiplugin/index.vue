<template>
  <div class="overflow-y-auto h-full" v-if="!deatilVisible">
    <Topbar :title="t('插件库')" class="!mb-0 lg:!mb-4" />
    <ContentLayout class="!overflow-hidden !h-auto pt-8 lg:pt-0">
      <el-card class="box-card flex flex-col">
        <div class="flex items-start p-4 border-b">
          <img src="logo.png" alt="Logo" class="h-12 w-12 mr-4" />
          <div class="flex flex-col justify-between">
            <h3 class="font-semibold text-lg">小红书智能评论插件</h3>
            <p class="text-sm text-gray-600 mt-2">3234人使用</p>
            <p class="text-sm text-yellow-500 mt-1">评分5分</p>
          </div>
        </div>
        <div class="p-4 flex-1 space-y-4">
          <p class="text-sm text-gray-600">
            帮助商家和创作者在小红书平台进行社交营销的神器。它能基于用户设置的主题和需求,自动生成相关的评论内容,实现在小红书上的精准获客。
          </p>
          <el-button class="w-full" @click="installDialogVisible = true">添加</el-button>
          <el-button class="w-full" @click="navigateToNextPage">使用</el-button>
        </div>
      </el-card>
    </ContentLayout>
    <el-dialog v-model="installDialogVisible" title="安装小红书插件步骤">
      <div class="steps-container">
        <div class="step-item" v-for="(step, index) in steps" :key="index">
          <p class="font-bold mt-5">{{ step.description }}</p>
          <img v-if="step.image" :src="step.image" alt="步骤图片" />
          <el-button class="mt-5" v-if="step.buttonText" type="primary" @click="step.action">{{
            step.buttonText
          }}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
  <router-view />
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
import ContentLayout from '@/layout/ContentLayout.vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { RoutesMap } from '../../router'

const { t } = useI18n()
const router = useRouter()

const installDialogVisible = ref(false)
const deatilVisible = ref(false)
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
    description: '第一步 下载插件',
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
    description: '第三步 点击 加载已解压的扩展程序',
    image: 'https://cdn.jsdelivr.net/gh/XmchxUp/cloudimg@master/20231111/image.38iz6eviup80.webp',
    buttonText: '',
    action: null
  }
])

function navigateToNextPage() {
  deatilVisible.value = true
  router.replace({ name: RoutesMap.aiPlugin.detail, params: { name: 'xhs' } })
  // router.push('/aiplugin/detail/xhs')
}
</script>
