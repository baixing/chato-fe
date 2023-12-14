<template>
  <Modal
    width="45%"
    mobile-width="100%"
    v-model:visible="visible"
    :title="$t(`获取小程序链接`)"
    :footer="false"
  >
    <p class="text-[#3D3D3D] font-medium mb-4">
      {{ $t('通过以下方式，可以访问小程序专属页面。') }}
    </p>
    <div class="text-left" v-loading="loading">
      <p class="text-[#3D3D3D] font-medium mr-3 mb-4">{{ $t('1、小程序码') }}</p>
      <p class="text-[#9DA3AF] my-3 md:text-xs">{{ $t('生成的小程序码，永久有效') }}</p>
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
      <p class="text-[#3D3D3D] font-medium mr-3 mb-4">{{ $t('2、小程序链接') }}</p>
      <p class="text-[#9DA3AF] my-3 md:text-xs">
        {{ $t('适用于短信、邮件、网页、微信内等拉起小程序的业务场景') }}
      </p>
      <div class="flex items-center">
        {{ appletAddress.link }}
        <el-button link type="primary" class="ml-3" @click="$copyText(appletAddress.link)">
          {{ $t('复制') }}
        </el-button>
      </div>
      <p class="text-[#3D3D3D] font-medium mr-3 my-4">{{ $t('3、第三方平台') }}</p>
      <p class="text-[#9DA3AF] my-3 md:text-xs">
        {{ $t('适用于被第三方平台托管的小程序，且三方平台支持配置跳转路径') }}
      </p>
      <div class="flex items-center mb-2">
        AppId： {{ appletAddress.appId }}
        <el-button link type="primary" class="ml-3" @click="$copyText(appletAddress.appId)">
          {{ $t('复制') }}
        </el-button>
      </div>
      <div class="flex items-center">
        页面路径：{{ page }}
        <el-button link type="primary" class="ml-3" @click="$copyText(page)">
          {{ $t('复制') }}
        </el-button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { getAppletLink2, getAppletQRCode2 } from '@/api/domain'
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps<{
  value: boolean
  slug: string
}>()
const emit = defineEmits(['update:value'])

const loading = ref(false)
const appletAddress = reactive({
  appId: 'wx22cd84d2c699aabd',
  link: '',
  url: ''
})

const page = computed(() => `pages/index/index?slug=${props.slug}`)

const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})

const onInit = async () => {
  loading.value = true
  const [link, QrCode] = await Promise.all([
    getAppletLink2(props.slug),
    getAppletQRCode2(props.slug)
  ])
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
