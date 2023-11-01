<template>
  <div class="flex justify-center items-center mb-4 text-[#E6A23C] text-sm">
    <el-icon size="16"><InfoFilled /></el-icon>
    <span class="ml-[8px]">{{ $t('绑定失败') }}</span>
  </div>
  <p class="text-[#596780] text-center text-xs flex items-center justify-center mb-3">
    {{ $t('操作频繁，请3分钟后尝试！') }}
  </p>
  <p class="text-center">
    <el-button type="primary" link @click="onContactUs">{{ $t('产品顾问') }}</el-button>
  </p>
</template>

<script setup lang="ts">
import useSpaceRights from '@/composables/useSpaceRights'
import { ESpaceRightsType } from '@/enum/space'

const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const onContactUs = () => {
  checkRightsTypeNeedUpgrade(ESpaceRightsType.weixinAccount)
}
</script>
