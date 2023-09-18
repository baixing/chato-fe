<template>
  <div class="flex justify-center items-center mb-[25px] text-[#E6A23C] text-sm">
    <el-icon size="16"><InfoFilled /></el-icon>
    <span class="ml-[8px]">{{ $t('绑定失败') }}</span>
  </div>
  <p class="text-[#596780] text-center text-xs flex items-center justify-center">
    {{ $t('您所在城市暂未开通该业务，如需开通请联系') }}
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
