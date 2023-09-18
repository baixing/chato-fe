<template>
  <div class="flex flex-col items-start justify-start text-[#596780] text-xs">
    <p class="create-account-title">{{ $t('使用须知') }}</p>
    <p class="mb-[10px]" v-for="item in RCreateAccountFormTip" :key="item">{{ $t(item) }}</p>
    <p class="create-account-title mt-[5px]">
      {{ $t(createStatus === EAccountSettingStatus.creating ? '扫码绑定账号' : '重新登陆账号') }}
    </p>
    <p class="mb-[12px]">{{ $t('请使用企业微信扫描下方二维码登录') }}</p>
    <div class="flex justify-start items-center mb-[12px]" v-loading="loading">
      <img class="w-[137px] h-[137px] rounded-md" :src="url" alt="" />
    </div>
    <p class="mb-[16px] text-[#E6A23C]">{{ $t('注：该功能为内测阶段，可能存在不稳定情况') }}</p>
    <el-row justify="end" class="w-full">
      <el-col :lg="4" :xl="4" :md="12" :xs="12" :sm="12">
        <el-button
          type="primary"
          :disabled="loading"
          size="large"
          @click="emit('handleSubmit', accountQrCode.qrCodeKey)"
        >
          {{ $t('下一步') }}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { $notnull } from '@/utils/help'
import type { ICreateAccountRes } from '@/interface/release'
import { EAccountSettingStatus } from '@/enum/release'
import { RCreateAccountFormTip } from '@/constant/release'

const props = defineProps<{
  accountQrCode: ICreateAccountRes
  loading: boolean
  createStatus: EAccountSettingStatus
}>()
const emit = defineEmits(['handleSubmit'])

const url = computed(() => ($notnull(props.accountQrCode) ? props.accountQrCode.qrCode : ''))
</script>
