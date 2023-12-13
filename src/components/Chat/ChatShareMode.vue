<template>
  <div>
    <div class="flex justify-center">
      <el-button @click="shareMode = false" class="mr-3 !px-8">取消</el-button>
      <el-button class="btn-grad !text-white !h-full !px-8" @click="share">分享</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { postShare } from '@/api/share'
import useGlobalProperties from '@/composables/useGlobalProperties'
import type { IMessageItem } from '@/interface/message'
import { ElNotification } from 'element-plus'
import { computed } from 'vue'

const props = defineProps<{
  shareList: IMessageItem['questionId'][]
  shareMode: boolean
}>()
const emit = defineEmits(['update:shareMode'])
const shareList = computed(() => props.shareList)
const shareMode = computed({
  get: () => props.shareMode,
  set: (v) => emit('update:shareMode', v)
})
const { $copyText } = useGlobalProperties()

const share = async () => {
  if (shareList.value.length === 0) return ElNotification.error('至少分享一条')
  const res = await postShare(shareList.value)
  $copyText(window.location.host + '/c/bot/share/' + res.data.data.tag)
}
</script>

<style lang="scss">
.btn-grad {
  background: linear-gradient(117deg, #0547ff -84%, #d683ff 125%);
}
</style>
