<template>
  <div>
    <div class="flex justify-center">
      <el-button @click="shareMode = false" class="mr-3 !px-8">取消</el-button>
      <el-button class="btn-grad !text-white !h-full !px-8" @click="share">分享</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAppletLink } from '@/api/domain'
import { postShare } from '@/api/share'
import useGlobalProperties from '@/composables/useGlobalProperties'
import { useSource } from '@/composables/useSource'
import { CHATO_SOURCE_APPLET } from '@/constant/common'
import type { IDomainInfo } from '@/interface/domain'
import type { IMessageItem } from '@/interface/message'
import { ElNotification } from 'element-plus'
import { computed } from 'vue'

const props = defineProps<{
  shareList: IMessageItem['questionId'][]
  shareMode: boolean
  detail: IDomainInfo
}>()
const { source } = useSource()
const emit = defineEmits(['update:shareMode'])
const isInApplet = computed(() => source.value === CHATO_SOURCE_APPLET) // 判断是否在小程序环境
const shareList = computed(() => props.shareList)
const shareMode = computed({
  get: () => props.shareMode,
  set: (v) => emit('update:shareMode', v)
})
const { $copyText } = useGlobalProperties()

const share = async () => {
  if (shareList.value.length === 0) return ElNotification.error('至少分享一条')
  if (isInApplet.value) {
    const res = await getAppletLink(props.detail.slug, 'pages/share/share')
    $copyText(res.data.data.url_link)
    return
  }
  const res = await postShare(shareList.value)
  $copyText(window.location.host + '/c/bot/share/' + res.data.data.tag)
  shareMode.value = false
}
</script>

<style lang="scss">
.btn-grad {
  background: linear-gradient(117deg, #0547ff -84%, #d683ff 125%);
}
</style>
