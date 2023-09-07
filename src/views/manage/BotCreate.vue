<template>
  <Topbar>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item>
        <a
          @click="onLinkBots"
          class="flex items-center !font-normal !text-[#909399] hover:!text-[#7c5cfc]"
        >
          <svg-icon svg-class="w-4 h-4 mr-1 mt-[-2px]" name="house" />{{ $t('我的 Bots') }}</a
        >
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <span class="text-[#303133]">{{ $t('创建机器人') }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </Topbar>
  <ContentLayout>
    <el-tabs v-model="activeTab" class="chato-tab">
      <el-tab-pane
        v-for="item in tabsList"
        :key="item.key"
        :label="item.label"
        :name="item.key"
        class="mt-4"
      >
        <component :is="item.component" @saveSuccess="onAfterSave" />
      </el-tab-pane>
    </el-tabs>
  </ContentLayout>
</template>

<script setup lang="ts">
import Topbar from '@/components/Topbar/index.vue'
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import { useDomainStore } from '@/stores/domain'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BotCreateByAI from './components/BotCreateByAI.vue'
import BotCreateByTemplate from './components/BotCreateByTemplate.vue'

const { t } = useI18n()
const tabsList = [
  {
    label: t('模板创建'),
    key: 'template',
    component: BotCreateByTemplate
  },
  { label: t('AI 一键创建'), key: 'ai', component: BotCreateByAI }
]

const router = useRouter()
const domainStoreI = useDomainStore()

const createDomainId = ref<string>()
const activeTab = ref('template')

const onLinkBots = () => {
  router.push({ name: RoutesMap.manager.center })
}

const onAfterSave = async (domainId: string) => {
  await domainStoreI.initDomainList()
  createDomainId.value = domainId
  domainStoreI.switchDomainInfoById(domainId)
  router.push({ name: RoutesMap.tranning.botUser, params: { botId: domainId } })
}
</script>
