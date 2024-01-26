<template>
  <el-form :model="currentDomain" label-width="auto" label-position="top" class="chato-form">
    <el-form-item>
      <template #label>
        <div class="flex justify-between items-center">
          <SLTitle
            :tips="
              $t(
                `根据您当前空间权益，可设置的套餐条数最多{count}条。可设置套餐金额最多300元，可设置天数最多365天`,
                { count: spaceQuota.total }
              )
            "
          >
            {{ t('付费规则') }}
          </SLTitle>
          <div class="flex items-center gap-3 lg:justify-between lg:w-full">
            <el-button size="small" type="primary" link @click="onViewRevenue">
              {{ $t('查看收益') }}
            </el-button>
            <SwitchWithStateMsg
              v-model:value="currentDomain.customer_limit.payment_limit_switch"
              close-msg="关闭"
              open-msg="开启"
            />
          </div>
        </div>
      </template>
      <el-card
        class="w-full"
        style="--el-box-shadow-light: none; --el-card-border-radius: 8px; --el-card-padding: 18px"
      >
        <div class="flex flex-col justify-start text-[#303133]">
          <p class="font-medium">{{ $t('触发条件') }}</p>
          <div class="text-sm font-normal leading-4 flex items-center gap-3">
            {{ $t('用户对话') }}
            <el-input-number
              v-model="currentDomain.customer_limit.payment_limit.total"
              :min="1"
              controls-position="right"
              class="!max-w-20 mx-2"
            />
            {{ $t('条，触发付费设置') }}
          </div>
          <p class="flex items-center font-medium my-4">
            {{ $t('套餐权益配置') }}
            <el-button type="primary" link class="ml-3" @click="onHandleSetPackage">
              {{ $t('查看示意图') }}
            </el-button>
          </p>
          <div class="text-sm font-normal leading-4 flex items-center gap-3 flex-wrap">
            {{ $t('条数') }}
            <el-input-number
              v-model="currentOrderDetail.total_quota"
              :min="1"
              :max="spaceQuota.total || 10000"
              controls-position="right"
              class="!max-w-20 mx-2"
            />
            {{ $t('金额') }}
            <el-input-number
              v-model="currentOrderDetail.price"
              :min="0.01"
              :max="300"
              controls-position="right"
              class="!max-w-20 mx-2"
            />
            {{ $t('元') }}
            <el-input-number
              v-model="currentOrderDetail.duration"
              :min="1"
              :max="365"
              controls-position="right"
              class="!max-w-20 mx-2"
            />
            {{ $t('天') }}
          </div>
        </div>
      </el-card>
    </el-form-item>
    <el-form-item>
      <template #label>
        <SLTitle tips="最多可试用10笔订单且总支付金额不能超过300元">
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
                v-model="currentDomain.customer_limit.rate_limit.time_seconds"
                controls-position="right"
                :class="
                  String(currentDomain.customer_limit.rate_limit.time_seconds).length > 4
                    ? 'w-[120px]'
                    : '!max-w-20'
                "
              />
              <el-select
                v-model="currentDomain.customer_limit.rate_limit.time_unit"
                class="ml-2 w-[74px]"
                :placeholder="$t('请选择频率')"
              >
                <el-option
                  v-for="item in frequencyUnitList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              ，{{ $t('只能发送') }}
              <el-input-number
                :min="1"
                :max="9999"
                v-model="currentDomain.customer_limit.rate_limit.num"
                controls-position="right"
                class="!max-w-20"
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
                class="!max-w-20"
              />
              {{ $t('条') }}
            </div>
            <p class="text-[#596780] mb-4">{{ $t('超出默认将回复') }}</p>
            <el-input type="text" v-model="currentDomain.customer_limit.quota_limit.response" />
          </div>
        </div>
      </div>

      <el-card
        class="w-full mt-6"
        style="--el-box-shadow-light: none; --el-card-border-radius: 8px; --el-card-padding: 18px"
      >
        <template #header>
          <div class="flex justify-between items-center text-sm font-medium">
            <span class="text-[#3D3D3D]">{{ $t('按手机号') }}</span>
            <div
              class=""
              @click.capture="
                (e) => onHandleSwitchMobile(e, currentDomain.customer_limit.mobile_limit_switch)
              "
            >
              <SwitchWithStateMsg
                v-model:value="currentDomain.customer_limit.mobile_limit_switch"
                size="small"
                close-msg="关闭"
                open-msg="开启"
              />
            </div>
          </div>
        </template>
        <div class="flex items-center text-[#3D3D3D]">
          <span class="mr-3">
            {{
              $t('已录入 {mobileNumber} 个手机号', {
                mobileNumber: pageMobileConfig.total
              })
            }}
          </span>
          <el-button link type="primary" @click="listManagementRef = true">
            {{ $t('名单管理') }}
          </el-button>
        </div>
      </el-card>
    </el-form-item>
    <el-form-item>
      <template #label>
        <div class="flex gap-[6px] items-center">
          <SLTitle tips="广告将按照以下频率和文案展示给用户；广告不计入电力值。">
            {{ t('对话广告') }}
          </SLTitle>
          <SpaceRightsFreeExpUpgrate
            v-if="currentRights.type === ESpaceCommercialType.free"
            :rights-type="ESpaceRightsType.brand"
          />
        </div>
      </template>
      <div class="w-full relative">
        <div
          class="flex justify-between items-center gap-5 mb-5 lg:flex-col lg:gap-3 lg:items-start"
        >
          <div class="text-sm text-[#3D3D3D] font-normal leading-4 flex items-center gap-3">
            {{ $t('每个用户每隔') }}
            <el-input-number
              v-model="currentDomain.ad_frequency"
              :min="1"
              controls-position="right"
              class="!max-w-20 mx-2"
            />
            {{ $t('条，展示一次广告') }}
          </div>
          <div class="flex items-center gap-3 lg:justify-between lg:w-full">
            <el-button
              size="small"
              type="primary"
              link
              @click="
                () => {
                  exampleVisible = true
                  imgKey = 'adImg'
                }
              "
            >
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
        <SpaceRightsMask :visible="maskVisible" />
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSave">{{ $t('保存设定') }}</el-button>
    </el-form-item>
  </el-form>
  <Modal
    v-model:visible="exampleVisible"
    :width="imgKey === 'payImg' ? '375px' : ''"
    title="查看示例"
    :footer="false"
  >
    <div class="max-h-[65vh] overflow-y-auto">
      <img
        :src="imgKey === 'payImg' ? payImg : ImagePath"
        class="w-full object-contain mx-auto"
        alt=""
      />
    </div>
  </Modal>
  <ListManagement
    v-bind="pageMobileConfig"
    v-model:page="pageMobileConfig.page"
    v-model:value="listManagementRef"
    :domainId="domainInfo.id"
    @handleReloadList="initMobileList"
  />
</template>

<script lang="ts" setup>
import { updateDomain } from '@/api/domain'
import { getCommonGraph, postCommonGraph } from '@/api/graph'
import payImg from '@/assets/img/pay-home.png'
import HansInputLimit from '@/components/Input/HansInputLimit.vue'
import Modal from '@/components/Modal/index.vue'
import SpaceRightsFreeExpUpgrate from '@/components/Space/SpaceRightsFreeExpUpgrate.vue'
import SpaceRightsMask from '@/components/Space/SpaceRightsMask.vue'
import SwitchWithStateMsg from '@/components/SwitchWithStateMsg/index.vue'
import SLTitle from '@/components/Title/SLTitle.vue'
import useImagePath from '@/composables/useImagePath'
import { FreeCommercialTypeExperienceDay } from '@/constant/space'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import type { IDomainInfo } from '@/interface/domain'
import type { IMobileLimitItem } from '@/interface/release'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { useDomainStore } from '@/stores/domain'
import { useSpaceStore } from '@/stores/space'
import { $notnull } from '@/utils/help'
import { getStringWidth } from '@/utils/string'
import { getSpecifiedDateSinceNowDay } from '@/utils/timeRange'
import { ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { cloneDeep } from 'lodash'
import { isEqual } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, reactive, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import CollectFormConfig from './components/CollectFormConfig.vue'
import ListManagement from './components/ListManagement.vue'

const { t } = useI18n()
const { ImagePath } = useImagePath('ad', 'example', 'webp')
const imgKey = ref<'payImg' | 'adImg'>('payImg')

const HansLimit = {
  adText: 100
}

const route = useRoute()
const router = useRouter()

const loading = ref()
const collectFormConfigRef = ref()
const listManagementRef = ref(false)
const spaceStoreI = useSpaceStore()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)
const { currentRights, spaceQuota } = storeToRefs(spaceStoreI)

const defaultCustomerLimit = {
  mobile_limit_switch: 0,
  rate_limit_switch: 0,
  payment_limit_switch: 0,
  payment_limit: { total: 60 },
  rate_limit: {
    time_unit: 1,
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

const currentOrderDetail = reactive({
  total_quota: 30,
  price: 30,
  duration: 365
})

const pageMobileConfig = reactive({
  page: 1,
  total: 0,
  page_count: 10,
  page_size: 10,
  mobileList: []
})

const DefaultADFrequency = 30
const DefaultADContent = t(
  'Chato ——基于AI技术 轻松创建对话机器人，赶快来 Chato 创建一个属于自己的机器人吧'
)

const frequencyUnitList = [
  {
    value: 1,
    label: t('秒')
  },
  {
    value: 60,
    label: t('分钟')
  },
  {
    value: 3600,
    label: t('小时')
  },
  {
    value: 3600 * 60,
    label: t('天')
  }
]

const baseStoreI = useBase()
const { orgInfo } = storeToRefs(baseStoreI)
const specifiedBetweenDay = getSpecifiedDateSinceNowDay(orgInfo.value.created)
const maskVisible = computed(
  () =>
    !currentRights.value.ad ||
    (currentRights.value.type === ESpaceCommercialType.free &&
      specifiedBetweenDay > FreeCommercialTypeExperienceDay)
)

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

// 保存套餐信息
const onSaveOrderInfo = async () => {
  try {
    const { data: data } = await getCommonGraph('customer_package', {
      filter: `domain_slug=="${domainInfo.value.slug}" and status=="active"`
    })

    const oldList = data.data
    if ($notnull(oldList)) {
      await postCommonGraph('customer_package/save', {
        id: oldList[0].id,
        status: 'invalid'
      })
    }

    await postCommonGraph('customer_package/save', {
      ...toRaw(currentOrderDetail),
      price: currentOrderDetail.price * 100,
      domain_slug: domainInfo.value.slug
    })
  } catch (error) {
    console.log(error)
  }
  // postUserPackageAPI(domainInfo.value.slug, {
  //   ...toRaw(currentOrderDetail),
  //   price: currentOrderDetail.price * 100
  // })
}

const onHandleSetPackage = () => {
  exampleVisible.value = true
  imgKey.value = 'payImg'
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

    await onSaveOrderInfo()
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

const initMobileList = async () => {
  const res = await getCommonGraph<IMobileLimitItem[]>(`domain_mobile_limit`, {
    filter: `domain_id==${domainInfo.value.id}`,
    page: pageMobileConfig.page,
    size: pageMobileConfig.page_size
  })
  const pagination = res.data.pagination
  pageMobileConfig.mobileList = res.data.data
  pageMobileConfig.page = pagination.page
  pageMobileConfig.total = pagination.total
  pageMobileConfig.page_count = pagination.page_count
  pageMobileConfig.page_size = pagination.size
}

const onHandleSwitchMobile = async (e: Event, mobileSwitch: number) => {
  e.stopPropagation()

  if (mobileSwitch === 0) {
    await showMobileSwitchWarning()
  }

  currentDomain.customer_limit.mobile_limit_switch = mobileSwitch === 1 ? 0 : 1
}

const showMobileSwitchWarning = async () => {
  await ElMessageBox.confirm(t('用量限制只对有网页、JS有效，其他端暂不可用'), t('温馨提示'), {
    confirmButtonText: t('确认'),
    cancelButtonText: t('取消'),
    type: 'warning'
  })
}

const onViewRevenue = () => {
  router.push({
    name: RoutesMap.namespace.income
  })
}

const initOrderInfo = async () => {
  const res = await getCommonGraph<any[]>(`customer_package`, {
    filter: `domain_slug=="${domainInfo.value.slug}" and status=="active"`,
    sort: '-id'
  })
  const orderList = res.data.data
  if (orderList.length) {
    const orderInfo = orderList[0]
    currentOrderDetail.duration = orderInfo.duration
    currentOrderDetail.price = Number(orderInfo.price / 100)
    currentOrderDetail.total_quota = orderInfo.total_quota
  }
}

watch(
  () => pageMobileConfig.page,
  () => {
    initMobileList()
  },
  { immediate: true }
)

watch(
  domainInfo,
  (v) => {
    const currentDomainInfo = { ...toRaw(v) }
    currentDomainInfo.ad_frequency = currentDomainInfo.ad_frequency || DefaultADFrequency
    currentDomainInfo.ad_content = currentDomainInfo.ad_content || DefaultADContent
    currentDomainInfo.customer_limit = {
      ...defaultCustomerLimit,
      ...currentDomainInfo.customer_limit
    }
    originalDomain = cloneDeep(currentDomainInfo)
    currentDomain = Object.assign(currentDomain, currentDomainInfo)
    initOrderInfo()
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
    if (isModified.value) {
      await ElMessageBox.confirm(t('当前页面有内容更新，请确认是否保存？'), t('温馨提示'), {
        confirmButtonText: t('保存'),
        cancelButtonText: t('取消'),
        type: 'warning'
      })
      await onSave()
    }
  } catch (e) {
  } finally {
    next()
  }
})

onBeforeUnmount(() => {
  window.onbeforeunload = null
})
</script>
