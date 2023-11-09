<template>
  <span
    v-if="specifiedBetweenDay > FreeCommercialTypeExperienceDay"
    class="flex items-center gap-1 text-xs"
  >
    <img :src="SVip" class="w-[29px] h-3 object-cover shrink-0" />
    <span class="text-[#9DA3AF]">{{ $t(props.upgradeText) }}</span>
    <el-button
      type="primary"
      size="small"
      link
      @click="checkRightsTypeNeedUpgrade(props.rightsType)"
    >
      {{ $t('升级版本') }}
    </el-button>
  </span>
  <span v-else class="text-[#E6A23C] text-xs">
    {{
      $t('限时免费体验付费权益，还可使用 {limit} 天', {
        limit: FreeCommercialTypeExperienceDay - specifiedBetweenDay
      })
    }}
  </span>
</template>

<script setup lang="ts">
import SVip from '@/assets/img/vip-s.png'
import useSpaceRights from '@/composables/useSpaceRights'
import { FreeCommercialTypeExperienceDay } from '@/constant/space'
import { ESpaceRightsType } from '@/enum/space'
import { useBase } from '@/stores/base'
import { getSpecifiedDateSinceNowDay } from '@/utils/timeRange'
import { storeToRefs } from 'pinia'

const props = withDefaults(
  defineProps<{
    rightsType?: ESpaceRightsType
    upgradeText?: string
    upgradeLink?: boolean
  }>(),
  {
    rightsType: ESpaceRightsType.default,
    upgradeText: '该功能为付费权益，试用已结束',
    upgradeLink: false
  }
)

const emit = defineEmits(['upgrade'])

const { checkRightsTypeNeedUpgrade } = useSpaceRights()
const baseStoreI = useBase()
const { orgInfo } = storeToRefs(baseStoreI)
const specifiedBetweenDay = getSpecifiedDateSinceNowDay(orgInfo.value.created)
</script>
