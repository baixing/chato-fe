<template>
  <div
    v-show="maskVisible"
    class="absolute bg-[#fffc] w-full top-0 left-0 right-0 bottom-0 flex items-center justify-center text-sm text-[#3D3D3D] z-[2]"
  >
    {{ $t('开通该功能请联系') }}
    <el-button type="primary" link @click="checkRightsTypeNeedUpgrade(props.rightsType)">
      {{ $t('产品顾问') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import useSpaceRights from '@/composables/useSpaceRights'
import type { ESpaceRightsType } from '@/enum/space'
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
  rightsType: ESpaceRightsType
}>()

const { checkRightsTypeNeedUpgrade } = useSpaceRights()

const maskVisible = computed(() => props.visible)
</script>
