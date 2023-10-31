<template>
  <el-form :model="currentDomain" label-width="auto" label-position="top" class="chato-form">
    <el-form-item>
      <template #label>
        <SLTitle
          tips="限制将作用于外部用户，同一设备同一浏览器访问时识别为一名用户，成员在后台训练时的对话量不在限制范围内；超出后的回复不计入电力值。"
        >
          {{ t('用量限制') }}
        </SLTitle>
      </template>
      <div class="flex gap-5 lg:flex-col w-full">
        <div class="border border-solid border-[#E4E7ED] rounded-lg flex-1">
          <div
            class="flex px-6 py-4 justify-between items-center text-sm left-5 font-medium"
            style="border-bottom: 1px solid #e4e7ed"
          >
            <span class="text-[#3D3D3D]">{{ $t('按使用频率') }}</span>
            <SwitchWithStateMsg
              v-model:value="currentDomain.customer_limit.rate_limit_switch"
              close-msg="关闭"
              open-msg="开启"
            />
          </div>
          <div class="p-6 text-[#3D3D3D] text-sm leading-4">
            <div class="flex gap-2 items-center mb-8 flex-wrap">
              {{ $t('每隔') }}
              <el-input-number
                :min="1"
                :max="60"
                v-model="currentDomain.customer_limit.rate_limit.time_seconds"
                controls-position="right"
                class="!w-20"
              />
              {{ $t('秒，只能发送') }}
              <el-input-number
                :min="1"
                :max="9999"
                v-model="currentDomain.customer_limit.rate_limit.num"
                controls-position="right"
                class="!w-20"
              />{{ $t('条') }}
            </div>
            <p class="text-[#596780] mb-4">{{ $t('超出默认将回复') }}</p>
            <el-input type="text" v-model="currentDomain.customer_limit.rate_limit.response" />
          </div>
        </div>
        <div class="border border-solid border-[#E4E7ED] rounded-lg flex-1">
          <div
            class="flex px-6 py-4 justify-between items-center text-sm left-5 font-medium"
            style="border-bottom: 1px solid #e4e7ed"
          >
            <span class="text-[#3D3D3D]">{{ $t('按使用量') }}</span>
            <SwitchWithStateMsg
              v-model:value="currentDomain.customer_limit.quota_limit_switch"
              close-msg="关闭"
              open-msg="开启"
            />
          </div>
          <div class="p-6 text-[#3D3D3D] text-sm leading-4">
            <div class="flex gap-2 items-center mb-8">
              {{ $t('每个用户总共可回复') }}
              <el-input-number
                :min="1"
                :max="9999"
                v-model="currentDomain.customer_limit.quota_limit.total"
                controls-position="right"
                class="!w-20"
              />
              {{ $t('条') }}
            </div>
            <p class="text-[#596780] mb-4">{{ $t('超出默认将回复') }}</p>
            <el-input type="text" v-model="currentDomain.customer_limit.quota_limit.response" />
          </div>
        </div>
      </div>
    </el-form-item>
    <div class="relative">
      <el-form-item>
        <template #label>
          <SLTitle tips="广告将按照以下频率和文案展示给用户；广告不计入电力值。">
            {{ t('对话广告') }}
          </SLTitle>
        </template>
        <div class="w-full">
          <div
            class="flex justify-between items-center gap-5 mb-5 lg:flex-col lg:gap-3 lg:items-start"
          >
            <div class="text-sm text-[#3D3D3D] font-normal leading-4 flex items-center gap-3">
              {{ $t('每个用户每隔') }}
              <el-input-number
                v-model="currentDomain.ad_frequency"
                :min="1"
                controls-position="right"
                class="!w-20 mx-2"
              />
              {{ $t('条，展示一次广告') }}
            </div>
            <div class="flex items-center gap-3 lg:justify-between lg:w-full">
              <el-button size="small" type="primary" link @click="() => (exampleVisible = true)">
                {{ $t('查看示例') }}
              </el-button>
              <SwitchWithStateMsg
                v-model:value="currentDomain.ad_show"
                close-msg="关闭"
                open-msg="开启"
              />
            </div>
          </div>
          <div v-show="currentDomain.ad_show">
            <HansInputLimit
              v-model:value="currentDomain.ad_content"
              type="textarea"
              :rows="3"
              :limit="HansLimit.adText"
              class="w-full mb-4"
            />
            <CollectFormConfig ref="collectFormConfigRef" />
          </div>
        </div>
      </el-form-item>
      <SpaceRightsMask :visible="maskVisible" :rightsType="ESpaceRightsType.brand" />
    </div>
    <el-form-item>
      <el-button type="primary" @click="onSave">{{ $t('保存设定') }}</el-button>
    </el-form-item>
  </el-form>
  <Modal v-model:visible="exampleVisible" title="查看示例" :footer="false">
    <div class="max-h-[65vh] overflow-y-auto">
      <img :src="AdImg" class="w-full object-contain mx-auto" alt="" />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { updateDomain } from '@/api/domain'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import Modal from '@/components/Modal/index.vue'
import SpaceRightsMask from '@/components/Space/SpaceRightsMask.vue'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import SLTitle from '@/components/Title/SLTitle.vue'
import useImagePath from '@/composables/useImagePath'
import { ESpaceRightsType } from '@/enum/space'
import type { IDomainInfo } from '@/interface/domain'
import { useDomainStore } from '@/stores/domain'
import { useSpaceStore } from '@/stores/space'
import { getStringWidth } from '@/utils/string'
import { ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { cloneDeep, isEmpty, isEqual } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, reactive, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import CollectFormConfig from './CollectFormConfig.vue'

const { t } = useI18n()
const { ImagePath: AdImg } = useImagePath('ad', 'example', 'webp')

const HansLimit = {
  adText: 100
}

const route = useRoute()

const loading = ref()
const collectFormConfigRef = ref()
const spaceStoreI = useSpaceStore()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const { currentRights } = storeToRefs(spaceStoreI)

const defaultCustomerLimit = {
  rate_limit_switch: 0,
  rate_limit: {
    time_seconds: 60,
    num: 60,
    response: t('当前咨询用户过多，请排队等候')
  },
  quota_limit_switch: 0,
  quota_limit: {
    total: 60,
    response: t('抱歉，您已经达到最大对话上限')
  }
}
let currentDomain = reactive<Partial<IDomainInfo>>({
  customer_limit: { ...defaultCustomerLimit }
})

const DefaultADFrequency = 30
const DefaultADContent = t(
  'Chato ——基于AI技术 轻松创建对话机器人，赶快来 Chato 创建一个属于自己的机器人吧'
)

const maskVisible = computed(() => !currentRights.value.ad)

const beforeSaveCheck = () => {
  let msg = ''

  if (getStringWidth(currentDomain.ad_content) > HansLimit.adText) {
    msg = t('广告文案不能超过 {slot1} 字符', { slot1: HansLimit.adText })
  }

  if (msg) {
    ElMessage.warning(msg)
    return false
  }

  return true
}

const exampleVisible = ref(false)

let originalDomain: Partial<IDomainInfo> = {}
// 是否修改过
const isModified = computed(() => !isEqual(currentDomain, originalDomain))

const syncOriginalFormState = () => {
  originalDomain = { ...toRaw(currentDomain) }
}

const onSave = async () => {
  if (!beforeSaveCheck()) {
    return
  }

  try {
    loading.value = ElLoading.service({
      lock: true,
      text: t('保存中'),
      background: 'rgba(0, 0, 0, 0.7)'
    })

    await updateDomain(currentDomain.id, currentDomain)
    collectFormConfigRef.value?.onUpdateAbleAdForm()
    await domainStoreI.initDomainList(route)
    syncOriginalFormState()
    ElNotification.success(t('保存成功'))
  } catch (e) {
  } finally {
    loading.value.close()
  }
}

watch(
  domainInfo,
  (v) => {
    const currentDomainInfo = { ...toRaw(v) }
    currentDomainInfo.ad_frequency = currentDomainInfo.ad_frequency || DefaultADFrequency
    currentDomainInfo.ad_content = currentDomainInfo.ad_content || DefaultADContent
    isEmpty(currentDomainInfo.customer_limit) &&
      (currentDomainInfo.customer_limit = { ...defaultCustomerLimit })
    originalDomain = cloneDeep(currentDomainInfo)
    currentDomain = Object.assign(currentDomain, currentDomainInfo)
  },
  { immediate: true }
)

onMounted(() => {
  window.onbeforeunload = () => {
    if (isModified.value) {
      return true
    }
  }
})

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

onBeforeUnmount(() => {
  window.onbeforeunload = null
})
</script>
