<template>
  <Modal
    v-model:visible="visible"
    :showClose="false"
    mobile-width="85%"
    width="300px"
    :footer="false"
    v-loading="loading"
  >
    <div class="flex justify-between items-center font-medium text-[#3D3D3D] text-sm">
      <div class="flex items-center">
        <svg-icon name="pay-coin" svg-class="w-5 h-5" />
        <span class="ml-1"> {{ $t('获取问答次数') }} </span>
      </div>
      <el-icon size="16" @click="visible = false"><Close /></el-icon>
    </div>
    <div class="my-5 py-6 px-8 rounded-lg text-center" style="border: 1px solid #e4e7ed">
      <p class="text-2xl font-medium text-[#303133]">
        {{ $t('{price}元', { price: orderDetail.price }) }}
      </p>
      <p class="text-[#596780] text-[13px] mt-4">
        {{ $t('{count}条对话', { count: orderDetail.total_quota }) }}
        {{ $t('有效期{count}天', { count: orderDetail.duration }) }}
      </p>
    </div>
    <div v-if="!isMobile" v-loading="loading" class="flex flex-col items-center justify-start">
      <p class="text-center text-[#303133] font-medium">{{ $t('打开微信扫一扫') }}</p>
      <img class="w-[236px] h-[236px]" :src="paymentQrCode" />
    </div>
    <el-button
      v-else
      type="warning"
      :disabled="!agreeBtn"
      size="large"
      class="w-full"
      @click="onHandlePay"
    >
      {{ $t('立即支付') }}
    </el-button>
    <p :class="['flex items-center justify-center text-[#9DA3AF] text-xs', isMobile ? 'mt-4' : '']">
      <el-checkbox
        v-if="isMobile"
        v-model="agreeBtn"
        size="small"
        style="margin-right: 6px; --el-color-primary: #fdbf14"
      />
      {{ $t('我已阅读') }}
      <el-link
        :underline="false"
        target="_blank"
        type="primary"
        class="!text-[12px] !font-normal !text-[#596780] ml-1"
        @click="openPreviewUrl(kUserPaymentLinkUrl)"
      >
        {{ $t('用户协议') }}
      </el-link>
    </p>
  </Modal>
</template>

<script setup lang="ts">
import { getJsApiPaySignAPI } from '@/api/auth'
import { getCommonGraph } from '@/api/graph'
import { postPurchaseProductionAPI } from '@/api/order'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { kUserPaymentLinkUrl } from '@/constant/terms'
import { EOrderPaymentStatus } from '@/enum/order'
import type { IDomainInfo } from '@/interface/domain'
import { useAuthStore } from '@/stores/auth'
import { cuserStore } from '@/stores/cuser'
import { copyPaste, isWechat, openPreviewUrl } from '@/utils/help'
import { payJSAPI } from '@/utils/pay'
import { ElNotification as Notification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import wx from 'weixin-js-sdk'

const props = defineProps<{
  value: boolean
  domainInfo: IDomainInfo
}>()

const emit = defineEmits(['update:value'])

const currentEnvIsWechat = isWechat()
const { t } = useI18n()
const { isMobile: mobile } = useBasicLayout()
const cuser = cuserStore()
const authStore = useAuthStore()
const { orderInfo } = storeToRefs(cuser)
const { uid } = storeToRefs(authStore)
const { loginStatus } = storeToRefs(cuser)
const agreeBtn = ref(true)
const paymentQrCode = ref('')
const loading = ref(true)
const isAppletEnv = ref(false)

const isMobile = computed(() => mobile.value)

let timer = null

const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})

const orderDetail = computed(() => {
  let pay = {
    duration: 0,
    price: 0,
    total_quota: 0
  }
  if (orderInfo.value.length) {
    const firstPackage = orderInfo.value[0]
    pay = {
      ...pay,
      ...firstPackage,
      price: Number((firstPackage.price / 100).toFixed(2))
    }
  }
  return pay
})

const determinePayType = (isMobile, isWechatEnvironment) => {
  if (isWechatEnvironment && isMobile) return 0
  return isMobile ? 2 : 3
}

const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const startOrderStatusCheck = (orderId) => {
  clearTimer() // Ensure no timers are running before starting a new one
  timer = setInterval(() => {
    onSerachOrderStatus(orderId)
  }, 3000)
}

const handlePayment = (isMobile, isWechatEnvironment, paymentData) => {
  const { order_id, payment_code_url, payment_qr_code } = paymentData

  if (isMobile) {
    if (isWechatEnvironment) {
      return onWeixinPay(payment_code_url)
    }
    return (window.location.href = payment_code_url)
  } else {
    paymentQrCode.value = `data:image/png;base64,${payment_qr_code}`
    loading.value = false
    startOrderStatusCheck(order_id)
  }
}

const initPayCode = async () => {
  try {
    const payType = determinePayType(isMobile.value, currentEnvIsWechat)
    const packageId = orderInfo.value.length ? orderInfo.value[0].id : 0

    const res = await postPurchaseProductionAPI(props.domainInfo.slug, {
      package_id: packageId,
      customer_uuid: uid.value,
      pay_type: payType
    })

    const { order_id, payment_code_url, payment_qr_code } = res.data.data

    handlePayment(isMobile.value, currentEnvIsWechat, {
      order_id,
      payment_code_url,
      payment_qr_code
    })
  } catch (error) {
    console.error('Failed to initialize payment code:', error)
    loading.value = false
  }
}

// 查询订单状态
const onSerachOrderStatus = async (id: number) => {
  const res = await getCommonGraph<any>(`customer_order`, {
    filter: `domain_slug=="${props.domainInfo.slug}" and id=="${id}" and user_uuid=="${uid.value}"`
  })
  const { status } = res.data.data
  if (EOrderPaymentStatus.finish === status) {
    clearTimer()
    Notification.success(t('支付成功'))
    cuser.getCuserBuyOrderInfo(props.domainInfo.slug)
    visible.value = false
  }
}

const onWeixinPay = async (id: string) => {
  const res = await getJsApiPaySignAPI(id)
  const { data, sign_str } = res.data.data
  const params = {
    appId: data.app_id,
    timeStamp: data.timestamp,
    nonceStr: data.nonce_str,
    package: data.package,
    paySign: sign_str,
    signType: 'RSA'
  }
  const result = await payJSAPI(params)
  if (result) {
    Notification.success(t('支付成功'))
    visible.value = false
  } else {
    Notification.info(t('支付失败'))
  }
}

// 支付
const onHandlePay = async () => {
  if (!loginStatus.value) {
    return cuser.routerToLogin(props.domainInfo.slug, { pay: '1' })
  }

  if (isAppletEnv.value) {
    return copyPaste(
      `https://chato.cn/b/${props.domainInfo.slug}?source=Chato_share_web`,
      '链接已复制，小程序暂不支持支付，请在网页中打开'
    )
  }

  if (!orderInfo.value.length) {
    return Notification.error(t('订单信息缺失'))
  }

  initPayCode()
}

// 检测是否在小程序环境
const onCheckPayEnv = () => {
  wx.miniProgram.getEnv(function (res) {
    isAppletEnv.value = res.miniprogram
  })
}

onCheckPayEnv()

watch(
  visible,
  (v) => {
    if (!isMobile.value && v) {
      onHandlePay()
    }
  },
  { immediate: true }
)
</script>
