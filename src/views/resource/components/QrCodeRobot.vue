<template>
  <Modal
    width="500px"
    mobile-width="90%"
    :title="$t('小程序码')"
    v-model:visible="visible"
    :footer="false"
  >
    <div class="flex flex-col items-center" v-loading="loading">
      <img :src="`data:image/png;base64,${appletAddress.url}`" class="w-40 h-40" alt="" />
      <p class="text-[#9DA3AF] my-4 md:text-xs">{{ $t('扫码使用，永久有效') }}</p>
      <a
        :href="`data:image/png;base64,${appletAddress.url}`"
        :download="$t('二维码.png')"
        class="theme-color"
      >
        {{ $t('保存') }}
      </a>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { getAppletQRCode } from '@/api/domain'
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps<{
  value: boolean
  slug: string
}>()
const emit = defineEmits(['update:value'])

const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})

const loading = ref(false)

const appletAddress = reactive({
  url: ''
})

const onInit = async () => {
  loading.value = true
  const QrCode = await getAppletQRCode(props.slug)
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
