<template>
  <div class="overflow-y-auto h-full">
    <Topbar :title="t('插件库')" class="!mb-0 lg:!mb-4" />
    <ContentLayout class="!overflow-hidden !h-auto pt-8 lg:pt-0">
      <el-card class="box-card flex flex-col">
        <div class="flex items-start p-4 border-b">
          <img :src="logoData" alt="" class="w-[67px] h-[24px]" />
          <div class="flex flex-col justify-between ml-5">
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

const logoData =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMkAAABICAMAAABr9CFKAAAAP1BMVEUAAAD/I0L/JEL/JEH/JED/IED/JEH/JUL/JEL/I0H/IED/I0L/JEH/JUD/JEH/I0L/I0D/JEH/I0P/JEP/JEKyzp5HAAAAFHRSTlMA34BgQB+/n++gEJCwMHCfUM9Qz4ilXboAAAQzSURBVGje1ZrrtqMgDIW5S/HSm+//rLNmbFdNNybUg0zP/nd6DOaTkEBUbSr5lZIq1BRWGtROuXkt9UPZeaVQaqXXVt0vJiFGs/9Ckuu+KflCEl1mcyMeuF9MErYi8j5z6tUiP7O6B+MUle/jPOvO1yRBTyyJOk4dsWeljV/7GB+/3iqTnMHkxySoaDLBHMd6JDgllUhQ2uOooSpJTyxSPRJEQQ9dNRJMwZVJ8DEN659MLRKsikeSzANkyq4WCU7JoSSzeyfpK5HglBxMEt5JLpVIsCoeQkIfVRAdlEnkFHw4yURJbCUSrIqHkwyExNSr8R5cO5hEr0jCs5hczEo3nmTs1kr5KZnjZF/6N5hZFCjB2z3T0+RELjOLek1uoZRbLr74/FrtBBLIUMzTxMVvIJUW7+rxVxTmZSTJuzyChyhXhQRj1EslzfAkKe+KZuK5IUmE/MmseEi25FqUbUlCzC4Cic65GeQpaU/iPiEx4no3LUiYRYwkbHqYmE1FKxI08wLJKZOyT0zN+38k6hOSgR4WUb4VCbocGRL0JWRuDKTtSCZwmSGBq9nC6OqSRJYEnzKSyIA28ClYJjF6pUiHeert1xB6S3j6IhJx8+P/CapsKclp3qe73Rij40hwC5n4o8ABJCjtshXCSE55JjfBDuAQEpTZQQI7ArY0HUeCKPgcRRJuJZwhUA8kQT9gcJ4EwZnIa0USE0NikARfhRhuShqSzAYfpEgy5Dt/MJJrShJhlSaWBJM282ayKck8QqnjSLCQDkwKbksyba9sU/L7lWkMtyXp37aEV5EEyfNdCd0tmhqRdG9DBJnklj8EKLe7I4Htw4E6mdGgsa1GrAaZZNxYV+dDOxIoGykJHMxFEv9RF9IeRqIcSzLJJCrfwJiO7kjIb2wijJ0jEZPt/diOBApWOBRGkeSUC8fETEkjkjOkIolkIhaJI+lUQ5JI/pRI8DYXrqHqWpIYWPASSSL/8Ew5uaqWJB6GlkhUyMaP05iCW5IQv6IqIjEbS3q0hkq1JCFWQxmJK/1AsCkJCRYrkGBFGb+KxEGoSCTmZf5VJEpDqAgkI0ziZfwKkgkGFkhUwDfCMfSTpUoPt+xLAz0dwdUfkQxAkiJ4K3y+cSFTQq4FG68Lv3n4lMRnirpZ+eXtojPcB9a8TopzdsIz5n4SPI/1cD55TopmzhmwtO3W5xRYanRNErNpH15r5wYVnHs5dV1cZZztgLICSYpMR+Jh2cEo7PeSrvKUyCTYo8rvZLXPtbCZCtiXTkldEieZu5GNRa1Qt6IpCVVJcEAMGj4WbekHkPhWuDaJy1vLjUL5izvHhe25Bgnmmnz0o1IRcFFVnOuTTEwvCnQqAuGctUBZjQSDX49FARNNUpx6dkqqkmDwyw4OcXmhf+1sUry8DZsZot9LMuq1FFW6/vV/8XDonXroDwd3OfCOVCS+AAAAAElFTkSuQmCC'
</script>
