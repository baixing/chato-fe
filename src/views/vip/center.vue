<template>
  <Topbar :title="t('升级权益')" class="!mb-0 lg:!mb-4" />
  <ContentLayout>
    <div class="flex items-center gap-2 text-[#596780] text-sm my-8 lg:mt-0 lg:mb-4">
      <svg-icon name="rights-filled" />
      <span>{{ t('您当前套餐为') }}</span>
      <span class="text-[#7C5CFC]">{{ SpaceCommercialTypeMapper[currentRights.type] }}</span>
      <span>{{ t('可升级套餐包') }}</span>
    </div>
    <div class="grid grid-cols-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-5 lg:gap-4">
      <div
        v-for="item in packageList"
        :key="`package_${item.id}`"
        :class="[
          'relative bg-white rounded-lg pt-6 overflow-hidden cursor-pointer transition-all hover:scale-105 lg:flex lg:flex-row-reverse lg:py-3',
          currentRights.type === item.desc && 'border border-solid border-[#7C5CFC]',
          HigherCommercialType.includes(item.desc) && 'line-grad-gold-card-bg'
        ]"
      >
        <div
          class="flex flex-col items-center text-[#596780] px-6 border-solid border-b border-t-0 border-l-0 border-r-0 border-[#E4E7ED] lg:border-b-0 lg:border-l lg:px-3 lg:w-5/12 lg:justify-center"
        >
          <span
            :class="[
              'text-2xl font-medium',
              ESpaceCommercialType.freeFirstExp === item.desc &&
                '!text-transparent line-grad-purpple bg-clip-text',
              HigherCommercialType.includes(item.desc) &&
                '!text-transparent line-grad-gold bg-clip-text'
            ]"
          >
            {{ item.name }}
          </span>
          <div :class="['mb-4', ESpaceCommercialType.free !== item.desc && 'text-[#3D3D3D]']">
            <div class="flex justify-center text-4xl items-baseline my-3">
              <span class="text-base">￥</span>
              <span>{{ renderSalePrice(item.sale_price) }}</span>
            </div>
            <div class="text-sm text-center">
              <span v-if="ESpaceCommercialType.free === item.desc">
                {{ t('365 天，超出时间服务不可用') }}
              </span>
              <span v-else class="text-[#3D3D3D]">
                {{ `${item.days} ${t('天')}` }}
              </span>
            </div>
          </div>
          <el-button
            v-if="
              ESpaceCommercialType.freeFirstExp === item.desc && item.desc === currentRights.type
            "
            type="primary"
            class="rights-btn"
            data-sensors-pay-reserve="reserve"
            :data-sensors-pay-type="item.desc"
            @click="onReserve"
          >
            {{ t('预约训练师服务') }}
          </el-button>
          <el-button
            v-else
            type="primary"
            :disabled="ESpaceCommercialType.free === item.desc || item.desc === currentRights.type"
            :class="[
              'rights-btn !border-none',
              HigherCommercialType.includes(item.desc) && 'line-grad-gold-bg'
            ]"
            :data-sensors-pay-type="item.desc"
            @click="onUpgrade(item)"
          >
            {{ t(renderPackageBtn(item)) }}
          </el-button>
        </div>
        <div
          :class="[
            'p-6 space-y-4 text-[#596780] text-sm flex-1 lg:px-3 lg:py-0 lg:space-y-2',
            HigherCommercialType.includes(item.desc) && '!text-[#6C4E2D]'
          ]"
        >
          <p class="desc-between">
            <span>{{ t('创建机器人个数') }}</span>
            <span>{{ `${item.domain_num} ${t('个')}` }}</span>
          </p>
          <p class="desc-between">
            <span>{{ t('问答次数') }}</span>
            <span>{{ `${item.quota} ${t('条')}` }}</span>
          </p>
          <p class="desc-between">
            <span>{{ t('AI 绘画') }}</span>
            <span>{{ `${item.image_quota} ${t('条')}` }}</span>
          </p>
          <p class="desc-between">
            <span>{{ t('空间成员账号数') }}</span>
            <span>{{ `${item.account_num} ${t('个')}` }}</span>
          </p>
          <p class="desc-between">
            <span>{{ t('发布平台') }}</span>
            <span v-if="ESpaceCommercialType.free === item.desc">{{ t('网页 H5') }}</span>
            <span v-else class="flex gap-2 items-center text-[#303133]">
              {{ t('全平台') }}
              <el-tooltip
                placement="top"
                :content="
                  t(
                    '网页 H5、JS 嵌入、API 调用、朋友圈、钉钉、飞书、抖音、微信客服、微信公众号、微信小程序'
                  )
                "
              >
                <svg-icon
                  name="question-circle"
                  svg-class="text-[#596780] w-4 h-4 cursor-pointer"
                />
              </el-tooltip>
            </span>
          </p>
          <p class="desc-between">
            <span>{{ t('企微托管') }}</span>
            <SupportedRender :supported="item.trustee_account_num" />
          </p>
          <p class="desc-between">
            <span>{{ t('定制品牌显示') }}</span>
            <SupportedRender :supported="item.brand" />
          </p>
          <p class="desc-between">
            <span>{{ t('定制广告推送') }}</span>
            <SupportedRender :supported="item.ad" />
          </p>
          <p class="desc-between">
            <span>{{ t('对话问题推荐') }}</span>
            <SupportedRender :supported="Number(ESpaceCommercialType.free !== item.desc)" />
          </p>
          <p class="desc-between">
            <span>
              {{
                t(HigherCommercialType.includes(item.desc) ? '高级训练师服务' : '初级训练师服务')
              }}
            </span>
            <SupportedRender :supported="Number(ESpaceCommercialType.free !== item.desc)" />
          </p>
        </div>
        <span
          :class="[
            'absolute top-0 right-0 px-2 py-1 text-xs rounded-tr-md rounded-bl-lg text-white',
            HigherCommercialType.includes(item.desc) && 'line-grad-gold-tag-bg',
            [currentRights.type, ESpaceCommercialType.freeFirstExp].includes(item.desc) &&
              'line-grad-purpple'
          ]"
        >
          {{ t(renderRightsTag(item)) }}
        </span>
      </div>
    </div>
  </ContentLayout>
  <Modal v-model:visible="payModalVisible" title="微信扫码支付" width="310px" :footer="false">
    <div v-loading="payModalPaymentCodeLoading">
      <img class="w-[210px] h-[210px] mx-auto" :src="payModalPaymentCode" />
      <div
        class="py-4 text-primary font-bold w-full bg-[#F5F4F7] rounded-lg flex flex-col text-sm leading-5 items-center justify-center mt-4 space-y-1 text-[#3D3D3D]"
      >
        <span>
          {{ t('首单特惠仅需支付') }}
          <span class="text-[#7C5CFC]">{{ renderSalePrice(payModalPackage.sale_price) }}</span>
          {{ t('元') }}
        </span>
        <span> {{ t('即可获得 {days} 天会员权益', { days: payModalPackage.days }) }} </span>
      </div>
      <p class="text-xs text-[#B5BED0] mt-2 flex items-center justify-center">
        {{ t('开通前请阅读') }}
        <el-link
          :underline="false"
          target="_blank"
          type="primary"
          class="!text-[13px] !font-normal"
          @click="openPreviewUrl(kUserPaymentLinkUrl)"
        >
          {{ $t('《用户付费协议》 ') }}
        </el-link>
      </p>
    </div>
  </Modal>
  <Modal v-model:visible="reserveVisible" :footer="false" :title="t(`预约训练`)">
    <div class="text-center text-sm leading-4 text-[#596780]">
      <p>{{ t('联系训练师，预约训练服务。') }}</p>
      <el-link v-if="isMobile" :underline="false" type="primary" class="mt-6" :href="XIAONAQIWEI">
        {{ t('联系训练师') }}
      </el-link>
      <img v-else class="w-[400px] mt-6 mx-auto" src="@/assets/img/lock-crcode.png" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { getJsApiPaySignAPI, postWeixinH5Login } from '@/api/auth'
import { getCommonGraph } from '@/api/graph'
import { getOrderPackagePaymentCode } from '@/api/order'
import Topbar from '@/components/Topbar/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import useSpaceRights from '@/composables/useSpaceRights'
import { CHATO_BAIXING_APP_ID, XIAONAQIWEI } from '@/constant/common'
import { OrderPaymentStatus } from '@/constant/order'
import { SpaceCommercialTypeMapper } from '@/constant/space'
import { kUserPaymentLinkUrl } from '@/constant/terms'
import { EOrderPackageType, EOrderPaymentStatus, EWeixinH5LoginType } from '@/enum/order'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import type { IOrderPackage, IOrderPaymentStatus } from '@/interface/order'
import ContentLayout from '@/layout/ContentLayout.vue'
import router, { RoutesMap } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { useChatStore } from '@/stores/chat'
import { useDomainStore } from '@/stores/domain'
import { useSpaceStore } from '@/stores/space'
import { $notnull, isWechat, onRouteWeixinDefaultLogin, openPreviewUrl } from '@/utils/help'
import { payJSAPI } from '@/utils/pay'
import { ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import SupportedRender from './components/SupportedRender.vue'

const HigherCommercialType = [
  ESpaceCommercialType.selfProfessional,
  ESpaceCommercialType.selfStandard
]

const chatStoreI = useChatStore()
const domainStoreI = useDomainStore()
const baseStoreI = useBase()
const route = useRoute()
const { t } = useI18n()
const { isMobile } = useBasicLayout()

const authStoreI = useAuthStore()
const spaceStoreI = useSpaceStore()
const { currentRights } = storeToRefs(spaceStoreI)

const initing = ref(false)
const packageList = ref<IOrderPackage[]>([])

const renderPackageBtn = (item: IOrderPackage) => {
  if (HigherCommercialType.includes(item.desc)) {
    return '咨询客服'
  } else if (item.desc === currentRights.value.type) {
    return '使用中'
  } else {
    return '升级'
  }
}

const renderRightsTag = (item: IOrderPackage) => {
  if (currentRights.value.type === item.desc) {
    return '当前版本'
  } else if (HigherCommercialType.includes(item.desc)) {
    return '年套餐'
  } else if (item.desc === ESpaceCommercialType.freeFirstExp) {
    return '限购一次'
  } else {
    return ''
  }
}

const renderSalePrice = (price: number) => Math.floor(price / 100).toFixed(0)

const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const payModalVisible = ref(false)
const payModalPaymentCode = ref('')
const payModalPaymentCodeLoading = ref(false)
const payModalPackage = ref<IOrderPackage>()

const redirectCode = computed(() => (route.query.code as string) || '')

let refreshInterval = null
const currentEnvIsWechat = isWechat()

const determinePayType = (isMobile, isWechatEnvironment) => {
  if (isWechatEnvironment && isMobile) return 0
  return isMobile ? 2 : 3
}

const onOpenPay = async (item: IOrderPackage) => {
  try {
    if (!isMobile.value) {
      payModalVisible.value = true
      payModalPaymentCodeLoading.value = true
      payModalPackage.value = item
    }
    const payType = determinePayType(isMobile.value, currentEnvIsWechat)
    refreshInterval && clearInterval(refreshInterval)
    const {
      data: { data: paymentRes }
    } = await getOrderPackagePaymentCode({
      package_id: item.id,
      payment_price: item.sale_price,
      pay_type: payType
    })

    if (isMobile.value) {
      // 解决 safari window.open 拦截问题
      if (!currentEnvIsWechat) {
        setTimeout(() => {
          window.open(paymentRes.payment_code_url)
        })
      } else {
        onWeixinPay(paymentRes.payment_code_url)
      }
    } else {
      payModalPaymentCode.value = `data:image/png;base64,${paymentRes.payment_qr_code}`
    }

    refreshInterval = setInterval(async () => {
      const {
        data: { data }
      } = await getCommonGraph<IOrderPaymentStatus[]>('order', {
        filter: `id=="${paymentRes.order_id}"`
      })
      // refreshPaymentStatus(paymentRes.order_id)

      if ($notnull(data)) {
        const paymentStatusRes = data[0]
        if (paymentStatusRes.status !== EOrderPaymentStatus.paying) {
          ElNotification({
            message: t(OrderPaymentStatus[paymentStatusRes.status]),
            type: paymentStatusRes.status === EOrderPaymentStatus.paid ? 'success' : 'info'
          })
          payModalVisible.value = false
          spaceStoreI.initSpaceRights()
          clearInterval(refreshInterval)
        }
      }
    }, 2000)
  } catch (e) {
    refreshInterval && clearInterval(refreshInterval)
  } finally {
    payModalPaymentCodeLoading.value = false
  }
}

const onWeixinPay = async (id: string) => {
  const res = await getJsApiPaySignAPI(id)
  const { data, sign_str } = res.data.data
  const params = {
    appId: data.app_id,
    timeStamp: Number(data.timestamp),
    nonceStr: data.nonce_str,
    package: data.package,
    paySign: sign_str,
    signType: 'RSA'
  }
  const result = await payJSAPI(params)
  result ? ElNotification.success(t('支付成功')) : ElNotification.info(t('支付失败'))
}

const onUpgrade = (item: IOrderPackage) => {
  if (HigherCommercialType.includes(item.desc)) {
    checkRightsTypeNeedUpgrade(ESpaceRightsType.default)
  } else {
    onOpenPay(item)
  }
}

const reserveVisible = ref(false)

const onReserve = () => {
  reserveVisible.value = true
}

const onWeixinH5DefaultLogin = async () => {
  if (redirectCode.value) {
    const res = await postWeixinH5Login({
      code: redirectCode.value,
      app_id: CHATO_BAIXING_APP_ID,
      type: EWeixinH5LoginType.normal
    })
    const { need_bind_mobile, token, external_user_id } = res.data.data
    if (need_bind_mobile) {
      authStoreI.setToken('')
      router.replace({
        name: RoutesMap.auth.login,
        query: {
          userId: external_user_id,
          isbindingMobile: 'true',
          redirect: window.location.host + window.location.pathname,
          isMobile: 'true'
        }
      })
    } else {
      authStoreI.setToken(token)
      await baseStoreI.getAuthToken()
      await baseStoreI.getUserInfo()
      await Promise.all([
        domainStoreI.initDomainList(route),
        chatStoreI.initChatList(),
        spaceStoreI.initSpaceRights()
      ])

      spaceStoreI.initSpaceQuota()
    }
  } else {
    onRouteWeixinDefaultLogin(window.location.href, CHATO_BAIXING_APP_ID)
  }
}

const init = async () => {
  try {
    initing.value = true
    currentEnvIsWechat && onWeixinH5DefaultLogin()
    const {
      data: { data }
    } = await getCommonGraph<IOrderPackage[]>('package', {
      filter: `type=="${EOrderPackageType.buffet}"`,
      sort: 'sale_price'
    })
    // getOrderPackageList()
    packageList.value = data
  } catch (e) {
  } finally {
    initing.value = false
  }
}

init()

onMounted(() => {
  if (
    ![ESpaceCommercialType.free, ESpaceCommercialType.freeFirstExp].includes(
      currentRights.value.type
    )
  ) {
    router.replace({ name: RoutesMap.manager.center })
  }
})

onBeforeUnmount(() => {
  refreshInterval && clearInterval(refreshInterval)
})
</script>

<style lang="scss" scoped>
.rights-btn {
  @apply w-[69%] mb-6 transition-opacity hover:opacity-80 lg:w-11/12;
}

.line-grad-purpple {
  background-image: linear-gradient(112deg, #0547ff -82%, #d683ff 126%);
}

.line-grad-gold {
  background-image: linear-gradient(137deg, #493416 -24%, #eebf6d 116%);
}

.line-grad-gold-bg {
  background: linear-gradient(160deg, #503e28 -45%, #bc944d 80%);
}

.line-grad-gold-card-bg {
  background: linear-gradient(152deg, #ffeaaf -1%, #fffce7 109%);
}

.line-grad-gold-tag-bg {
  background: linear-gradient(172deg, #503e28 -136%, #bc944d 135%);
}

.desc-between {
  @apply flex justify-between items-center gap-2;

  span:nth-of-type(2) {
    @apply text-[#303133];
  }
}
</style>
