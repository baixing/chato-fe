<template>
  <div class="text-left" v-loading="loading">
    <p class="text-[#3D3D3D] font-medium mr-3 mb-3">{{ $t('1、小程序码') }}</p>
    <p class="text-[#9DA3AF] my-4 md:text-xs">{{ $t('生成的小程序码，永久有效') }}</p>
    <div class="flex justify-start items-center mb-4">
      <img :src="`data:image/png;base64,${appletAddress.url}`" class="w-32 h-32 mr-4" alt="" />
      <a
        :href="`data:image/png;base64,${appletAddress.url}`"
        :download="$t('二维码.png')"
        class="theme-color"
      >
        {{ $t('下载') }}
      </a>
    </div>
    <p class="text-[#3D3D3D] font-medium mr-3 mb-3">{{ $t('2、小程序链接') }}</p>
    <p class="text-[#9DA3AF] my-4 md:text-xs">
      {{ $t('适用于短信、邮件、网页、微信内等拉起小程序的业务场景') }}
    </p>
    <div class="flex items-center">
      {{ appletAddress.link }}
      <el-button link type="primary" class="ml-3" @click="$copyText(appletAddress.link)">
        {{ $t('复制') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAppletLink, getAppletQRCode } from '@/api/domain'
import { reactive, ref, watch } from 'vue'

const props = defineProps<{
  value: boolean
  slug: string
}>()

const loading = ref(false)

const appletAddress = reactive({
  link: '',
  url: ''
})

const onInit = async () => {
  loading.value = true
  const [link, QrCode] = await Promise.all([getAppletLink(props.slug), getAppletQRCode(props.slug)])
  appletAddress.link = link.data.data.url_link
  appletAddress.url = QrCode.data.data.QRCode
  loading.value = false
}

watch(
  () => props.value,
  (v) => {
    v && onInit()
  },
  { immediate: true }
)
</script>
