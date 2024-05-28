<template>
  <div class="bg-[#F2F3F5] flex gap-4 h-full w-full overflow-hidden">
    <div class="bg-white flex-1 flex flex-col h-full overflow-hidden">
      <div class="flex-1 mt-8 overflow-hidden">
        <el-tabs
          type="card"
          :model-value="activeTab"
          @tab-click="({ paneName }) => onClickTab(paneName)"
          class="chato-card-tab w-full info-tab"
        >
          <el-tab-pane
            v-for="item in filteredTabComponents"
            :key="item.key"
            :name="item.key"
            :label="$t(item.title)"
            class="h-full overflow-y-auto information-padding"
          >
            <component :is="item.component" :domainLLMTypeOptions="domainLLMTypeOptions" />
          </el-tab-pane>
        </el-tabs>
      </div>
      <div
        class="py-4 box-border flex justify-end items-center gap-4 information-padding"
        style="border-top: 1px solid #e4e7ed"
      >
        <el-popconfirm width="250" :title="saveConfirmText" @confirm="onSave">
          <template #reference>
            <el-button type="primary" :disabled="processLimit.includes(currentDomain.status)">{{
              $t('保存设定')
            }}</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
    <DebugChat v-if="!isMobile" />
  </div>

  <Modal
    v-model:visible="visible"
    :width="300"
    class="!p-0 flex justify-center !pb-4"
    :slotHeader="false"
    :footer="false"
  >
    <div class="h-[150px] flex justify-center">
      <img :src="IconReward" class="w-[200px] h-full object-cover" />
    </div>
    <div class="text-center mt-4 text-[#3D3D3D] text-base font-medium mb-3">
      {{ $t('恭喜你，完成') }}
      <span class="text-[#7C5CFC]">{{ $t('配置形象信息') }}</span>
      {{ $t('任务') }}
    </div>
    <!-- <div class="text-[#596780] text-xs text-center">
      {{ $t('获得电力值') }} <span class="text-[#7C5CFC]">+100</span>
    </div> -->
  </Modal>

  <span
    v-if="isMobile"
    @click="chatMobileModalVisible = true"
    class="absolute flex gap-1 items-center cursor-pointer transition-colors text-sm text-[#3D3D3D] right-4 top-3 hover:text-[#7c5cfc]"
  >
    <svg-icon name="phone-preview" svg-class="w-6 h-6 shrink-0" />
    <span>{{ $t('预览') }}</span>
  </span>

  <el-drawer
    v-if="isMobile"
    v-model="chatMobileModalVisible"
    :with-header="false"
    size="100%"
    append-to-body
    class="chat-mobile-chat-drawer relative"
  >
    <el-icon
      :size="24"
      class="!absolute top-4 left-4 z-[51] !text-[#4F4F4F] cursor-pointer hover:opacity-80"
      @click="chatMobileModalVisible = false"
    >
      <Close />
    </el-icon>
    <DebugChat class="!w-full !h-full" />
  </el-drawer>
</template>

<script setup lang="ts">
import { updateDomain } from '@/api/domain'
import IconReward from '@/assets/img/Icon-Reward.png'
import { useBasicLayout } from '@/composables/useBasicLayout'
import useGlobalProperties from '@/composables/useGlobalProperties'
import { SUPPORT_LLM_CONFIG } from '@/constant/common'
import {
  DebugDomainSymbol,
  DomainEditSymbol,
  DomainHansLimitSymbol,
  processLimit
} from '@/constant/domain'
import { EDomainStatus, EDomainType } from '@/enum/domain'
import type { IDomainInfo, IDomainLLMConfig } from '@/interface/domain'
import { RoutesMap } from '@/router'
import { useDomainStore } from '@/stores/domain'
import { regExtractContent, regExtractExample } from '@/utils/reg'
import { getStringWidth } from '@/utils/string'
import dayjs from 'dayjs'
import { ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { cloneDeep, isEqual } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import AdvancedSetting from './components/AdvancedSetting.vue'
import BaiduInfo from './components/BaiduInfo.vue'
import BaseInfo from './components/BaseInfo.vue'
import DebugChat from './components/DebugChat.vue'
import InterfaceSetting from './components/InterfaceSetting.vue'

const { t } = useI18n()
const { isMobile } = useBasicLayout()
const route = useRoute()
const router = useRouter()

const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const visible = ref(false)
let originalDomain: Partial<IDomainInfo> = {}
let currentDomain = reactive<Partial<IDomainInfo>>({})
const currentDomainHansLimit = reactive({
  name: 50,
  system_prompt: 900,
  desc: 300,
  welcome: 2000,
  keyword: 20,
  brandName: 40,
  keywordReply: 200
})
const chatMobileModalVisible = ref(false)
const domainLLMTypeOptions = ref<IDomainLLMConfig[]>([])
const { $sensors } = useGlobalProperties()
const activeTab = computed(() => (route.params?.type as string) || 'base')
// 是否修改过
const isModified = () => !isEqual(currentDomain, originalDomain)
const isShowSiderBar = computed(() => (route.query.showBar as string) || '')

const saveConfirmText = computed(() =>
  currentDomain.type !== EDomainType.wenxin
    ? '您确认要修改吗？'
    : '请谨慎操作！修改资料可能会导致百度智能体审核不通过，'
)

const tabComponents = [
  { key: 'base', title: '基础配置', component: BaseInfo, showWhenStatusZero: true },
  {
    key: 'advanced',
    title: '高级设置',
    component: AdvancedSetting,
    showWhenStatusZero: false
  },
  {
    key: 'interface',
    title: '界面设置',
    component: InterfaceSetting,
    showWhenStatusZero: false
  }
]

// 计算属性，根据 currentDomain.status 过滤出需要显示的 tabs
const filteredTabComponents = computed(() => {
  if (currentDomain.type === EDomainType.wenxin) {
    // 如果 currentDomain.status 等于 0，则只返回 showWhenStatusZero 为 true 的 tabs
    const mapTabComponents = tabComponents.map((item) => {
      if (item.key === 'base') {
        item.component = BaiduInfo
      }
      return item
    })

    const filterTabComponents = mapTabComponents.filter((item) => item.showWhenStatusZero)

    return filterTabComponents
  }
  // 否则返回所有 tabs
  return tabComponents
})

const onClickTab = (v) => {
  router.push({ name: RoutesMap.tranning.roleInfo, params: { type: v } })
}

const syncOriginalFormState = () => {
  originalDomain = { ...toRaw(currentDomain) }
}

const loading = ref()

const beforeSaveCheck = () => {
  let msg = ''

  if (getStringWidth(currentDomain.name) > currentDomainHansLimit.name) {
    msg = t('机器人名称不能超过 {limitNum} 字符', {
      limitNum: currentDomainHansLimit.name
    })
  } else if (getStringWidth(currentDomain.system_prompt) > currentDomainHansLimit.system_prompt) {
    msg = t('角色设定不能超过 {limitNum} 字符', {
      limitNum: currentDomainHansLimit.system_prompt
    })
  } else if (getStringWidth(currentDomain.desc) > currentDomainHansLimit.desc) {
    msg = t('角色简介不能超过 {limitNum} 字符', {
      limitNum: currentDomainHansLimit.desc
    })
  } else if (getStringWidth(currentDomain.welcome) > currentDomainHansLimit.welcome) {
    msg = t('欢迎语不能超过 {limitNum} 字符', {
      limitNum: currentDomainHansLimit.welcome
    })
  }

  if (msg) {
    ElMessage.warning(msg)
    return false
  }

  return true
}

const setModifyFields = (keys: (keyof IDomainInfo)[]) => {
  return keys.every((value) => currentDomain[value] === originalDomain[value])
}

const onSave = async () => {
  try {
    if (!beforeSaveCheck()) {
      return
    }
    loading.value = ElLoading.service({
      lock: true,
      text: t('保存中'),
      background: 'rgba(0, 0, 0, 0.7)'
    })
    if (
      !setModifyFields(['avatar', 'name', 'welcome', 'system_prompt', 'desc']) &&
      currentDomain.task_progress[0] === 0
    ) {
      currentDomain.task_progress[0] = 20
      visible.value = true
      sensorsTaskProgress()
      setTimeout(() => {
        visible.value = false
      }, 2000)
    }

    let postCurrentDomain = cloneDeep({ ...currentDomain })

    if (postCurrentDomain.type === EDomainType.wenxin) {
      postCurrentDomain.welcome = postCurrentDomain.welcome + '\n' + postCurrentDomain.example
      delete postCurrentDomain.example
    }

    await updateDomain(postCurrentDomain.id, {
      ...postCurrentDomain,
      status: EDomainStatus.able
    })
    await domainStoreI.initDomainList(route)
    syncOriginalFormState()
    ElNotification.success(t('保存成功'))
  } catch (e) {
  } finally {
    loading.value.close()
  }
}

const sensorsTaskProgress = () => {
  $sensors?.track('mission_completed', {
    name: t('任务完成'),
    type: 'mission_completed',
    data: {
      task_progress: 0,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })
}

const initLLMConfigOption = () => {
  domainLLMTypeOptions.value = SUPPORT_LLM_CONFIG
  if (!currentDomain.llm && SUPPORT_LLM_CONFIG.length > 0) {
    currentDomain.llm = SUPPORT_LLM_CONFIG[0].type
  }
}

watch(
  domainInfo,
  (v) => {
    const currentDomainInfo = { ...toRaw(v) }
    currentDomainInfo.llm = currentDomainInfo.llm || null
    currentDomainInfo.lang = currentDomainInfo.lang === 'auto' ? null : currentDomainInfo.lang
    currentDomainInfo.reply_length = currentDomainInfo.reply_length || null
    currentDomainInfo.qa_threshold = currentDomainInfo.qa_threshold || 80
    currentDomainInfo.doc_threshold = currentDomainInfo.doc_threshold || 60
    currentDomainInfo.not_embedding_return_enabled =
      currentDomainInfo.not_embedding_return_enabled || 0
    currentDomainInfo.not_embedding_return_content =
      currentDomainInfo.not_embedding_return_content ||
      t(
        '抱歉，我还没有学习到关于这个问题的知识。您可以尝试问些其他问题，或者联系我们的专业团队以获取支持。'
      )
    originalDomain = cloneDeep({
      ...currentDomainInfo,
      llm: currentDomainInfo.llm || '7e78bce4872633c2',
      qa_modifiable: currentDomainInfo.qa_modifiable || 0
    })

    currentDomainInfo.example = ''

    // 设置example 和 welcome
    if (currentDomainInfo.type == EDomainType.wenxin) {
      currentDomainHansLimit.name = 20
      currentDomainHansLimit.system_prompt = 1000
      currentDomainHansLimit.desc = 50
      currentDomainHansLimit.welcome = 200
      currentDomainInfo.example = regExtractExample(currentDomainInfo.welcome) || ''
      currentDomainInfo.welcome = regExtractContent(currentDomainInfo.welcome) || ''
    }

    currentDomain = Object.assign(currentDomain, currentDomainInfo)
  },
  { immediate: true, deep: true }
)
onBeforeRouteLeave(async (to, from, next) => {
  try {
    if (!isModified()) {
      return
    }

    if (currentDomain.type === EDomainType.wenxin) {
      return
    }
    await ElMessageBox.confirm(t('当前页面有内容更新，请确认是否保存？'), t('温馨提示'), {
      confirmButtonText: t('保存'),
      cancelButtonText: t('取消'),
      type: 'warning'
    })
    await onSave()
  } catch (e) {
  } finally {
    next()
  }
})

provide(DebugDomainSymbol, currentDomain)
provide(DomainEditSymbol, currentDomain)
provide(DomainHansLimitSymbol, currentDomainHansLimit)

onMounted(() => {
  initLLMConfigOption()
  window.onbeforeunload = () => {
    if (isModified()) {
      return true
    }
  }
})

onBeforeUnmount(() => {
  window.onbeforeunload = null
})
</script>

<style lang="scss" scoped>
.information-padding {
  @apply px-16 lg:px-4;
}

.info-tab {
  & > :deep(.el-tabs__header) {
    @apply information-padding;
  }
}
</style>
