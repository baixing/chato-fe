<template>
  <div
    v-loading="!createGroupRes.qrcode_data"
    v-if="type === EActivateGroupType.createGroupChat"
    class="w-full flex justify-start cursor-pointer items-center mb-[16px] text-[#9DA3AF] leading-4"
  >
    <img
      :src="createGroupRes.qrcode_data"
      class="w-[180px] h-[180px] mr-[24px] md:w-[100px] md:h-[100px] md:mr-[12px] rounded-lg"
      alt=""
    />
    <div class="text-[12px] text-[#9DA3A] w-full">
      <p class="text-[#303133] text-[14px] mb-[16px] md:mb-[12px]">
        {{ $t('扫一扫左侧二维码，加入群聊') }}
      </p>
      <p class="text-sm text-[#303133] mb-[12px] md:mb-[6px] font-medium">{{ $t('用户须知') }}：</p>
      <p class="leading-7 md:leading-6" v-for="item in RActivedGroupTipConfig[type]" :key="item">
        {{ $t(item) }}
      </p>
    </div>
  </div>
  <div v-else class="mb-[16px] text-[#303133] text-xs">
    <p class="font-medium mb-[12px] text-sm">{{ $t(RActivedGroupTitleConfig[type]) }}</p>
    <p>{{ $t('机器人二维码') }}</p>
    <div class="flex justify-start items-center my-[14px]">
      <img
        :src="createGroupRes.qrcode_data"
        alt=""
        class="w-[120px] h-[120px] mr-[12px] md:w-[100px] md:h-[100px] rounded-lg"
      />
    </div>
    <p class="flex justify-start items-center">
      {{ $t(RActivedGroupTokenConfig[type]) }}：
      <span class="text-[#596780] mx-[16px]">{{ createGroupRes?.secret }}</span>
      <el-button type="primary" @click="$copyText(createGroupRes?.secret)" link>
        {{ $t('复制') }}
      </el-button>
    </p>
    <p class="font-medium text-sm my-[12px]">{{ $t('使用说明') }}</p>
    <p v-for="item in RActivedGroupTipConfig[type]" :key="item" class="text-[#596780] mb-[10px]">
      {{ $t(item) }}
    </p>
  </div>
  <el-row justify="end">
    <el-col :lg="4" :xl="4" :md="12" :xs="12" :sm="12">
      <el-button @click="emit('handleClose')" type="primary">{{ $t('完成') }}</el-button>
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import type { ICreateGroupRes } from '@/interface/release'
import { EActivateGroupType } from '@/enum/release'
import {
  RActivedGroupTipConfig,
  RActivedGroupTitleConfig,
  RActivedGroupTokenConfig
} from '@/constant/release'

defineProps<{
  createGroupRes: ICreateGroupRes
  type: EActivateGroupType
}>()
const emit = defineEmits(['handleClose'])
</script>
