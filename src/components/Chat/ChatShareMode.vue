<template>
  <div>
    <div class="flex justify-center">
      <el-button @click="shareMode = false" class="mr-3 !px-8">取消</el-button>
      <el-button class="btn-grad !text-white !h-full !px-8" @click="share">分享</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IMessageItem } from '@/interface/message'
import { computed } from 'vue'

const props = defineProps<{
  shareList: IMessageItem['id'][]
  shareMode: boolean
}>()
const emit = defineEmits(['update:shareMode'])
const shareList = computed(() => props.shareList)
const shareMode = computed({
  get: () => props.shareMode,
  set: (v) => emit('update:shareMode', v)
})

const share = () => console.log(shareList.value)
</script>

<style lang="scss">
.btn-grad {
  background: linear-gradient(117deg, #0547ff -84%, #d683ff 125%);
}
</style>
