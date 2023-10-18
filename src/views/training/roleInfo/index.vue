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
            v-for="item in tabComponents"
            :key="item.key"
            :name="item.key"
            :label="$t(item.title)"
            class="h-full overflow-y-auto information-padding"
          >
            <component :is="item.component" />
          </el-tab-pane>
        </el-tabs>
      </div>
      <div
        class="py-4 box-border flex justify-end items-center gap-4 information-padding"
        style="border-top: 1px solid #e4e7ed"
      >
        <el-button plain @click="onCancel">{{ $t('不保存') }}</el-button>
        <el-button type="primary" @click="onSave">{{ $t('保存设定') }}</el-button>
      </div>
    </div>
    <DebugChat v-if="!isMobile" />
  </div>

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
    <DebugChat class="!w-full !h-full" />
    <el-icon
      :size="24"
      class="!absolute top-4 right-4 z-[51] !text-[#4F4F4F] cursor-pointer hover:opacity-80"
      @click="chatMobileModalVisible = false"
    >
      <Close />
    </el-icon>
  </el-drawer>
</template>

<script setup lang="ts">
import { updateDomain } from '@/api/domain'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { DebugDomainSymbol, DomainEditSymbol, DomainHansLimitSymbol } from '@/constant/domain'
import { EDomainLLMType } from '@/enum/domain'
import type { IDomainInfo } from '@/interface/domain'
import { RoutesMap } from '@/router'
import { useDomainStore } from '@/stores/domain'
import { getStringWidth } from '@/utils/string'
import { ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { cloneDeep, isEqual } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import AdvancedSetting from './components/AdvancedSetting.vue'
import BaseInfo from './components/BaseInfo.vue'
import DebugChat from './components/DebugChat.vue'
import InterfaceSetting from './components/InterfaceSetting.vue'

const { t } = useI18n()
const { isMobile } = useBasicLayout()
const route = useRoute()
const router = useRouter()

const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)

let originalDomain: Partial<IDomainInfo> = {}
let currentDomain = reactive<Partial<IDomainInfo>>({})
const currentDomainHansLimit = reactive({
  name: 20,
  system_prompt: 900,
  desc: 300,
  welcome: 2000,
  keyword: 20,
  brandName: 40,
  keywordReply: 200
})
const chatMobileModalVisible = ref(false)

const activeTab = computed(() => (route.params?.type as string) || 'base')
// 是否修改过
const isModified = computed(() => !isEqual(currentDomain, originalDomain))

const tabComponents = [
  { key: 'base', title: '基础信息', component: BaseInfo },
  { key: 'advanced', title: '高级设置', component: AdvancedSetting },
  { key: 'interface', title: '界面设置', component: InterfaceSetting }
]

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
    msg = t('机器人名称不能超过 {limitNum} 字符', { limitNum: currentDomainHansLimit.name })
  } else if (getStringWidth(currentDomain.system_prompt) > currentDomainHansLimit.system_prompt) {
    msg = t('角色设定不能超过 {limitNum} 字符', { limitNum: currentDomainHansLimit.system_prompt })
  } else if (getStringWidth(currentDomain.desc) > currentDomainHansLimit.desc) {
    msg = t('角色简介不能超过 {limitNum} 字符', { limitNum: currentDomainHansLimit.desc })
  } else if (getStringWidth(currentDomain.welcome) > currentDomainHansLimit.welcome) {
    msg = t('欢迎语不能超过 {limitNum} 字符', { limitNum: currentDomainHansLimit.welcome })
  }

  if (msg) {
    ElMessage.warning(msg)
    return false
  }

  return true
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

    await updateDomain(currentDomain.id, currentDomain)
    await domainStoreI.initDomainList(route)
    syncOriginalFormState()
    ElNotification.success(t('保存成功'))
  } catch (e) {
  } finally {
    loading.value.close()
  }
}

const onCancel = () => {
  currentDomain = Object.assign(currentDomain, originalDomain)
}

watch(
  domainInfo,
  (v) => {
    const currentDomainInfo = { ...toRaw(v) }
    currentDomainInfo.llm = currentDomainInfo.llm || EDomainLLMType.azure
    currentDomainInfo.lang = currentDomainInfo.lang === 'auto' ? null : currentDomainInfo.lang
    currentDomainInfo.reply_length = currentDomainInfo.reply_length || null
    originalDomain = cloneDeep(currentDomainInfo)
    currentDomain = Object.assign(currentDomain, currentDomainInfo)
  },
  { immediate: true }
)

onBeforeRouteLeave(async (to, from, next) => {
  try {
    if (!isModified.value) {
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
  window.onbeforeunload = () => {
    if (isModified.value) {
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