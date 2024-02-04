<template>
  <div class="flex flex-col items-start justify-start text-[#596780] text-xs">
    <p class="create-account-title">{{ $t('使用须知') }}</p>
    <p class="mb-[10px]" v-for="item in RCreateAccountFormTip" :key="item">{{ $t(item) }}</p>
    <p class="create-account-title mt-[5px]">
      {{ $t(createStatus === EAccountSettingStatus.creating ? '扫码绑定账号' : '重新登陆账号') }}
    </p>
    <template v-if="!isCode">
      <p class="mb-[12px]">{{ $t('请使用企业微信扫描下方二维码登录') }}</p>
      <div class="flex justify-start items-center mb-[12px]" v-loading="loading">
        <img class="w-[137px] h-[137px] rounded-md" :src="url" alt="" />
      </div>
    </template>
    <el-row justify="end" :gutter="20" class="w-full mb-2" v-else>
      <el-col :span="16">
        <el-input size="large" :placeholder="$t('请输入验证码')" type="text" v-model="code" />
      </el-col>
      <el-col :span="8">
        <el-button
          type="default"
          style="--el-button-text-color: #7c5cfc; --el-button-border-color: #7c5cfc"
          size="large"
          @click="handleSubmitCode"
        >
          {{ $t('提交') }}
        </el-button>
      </el-col>
    </el-row>
    <p class="mb-[16px] text-[#E6A23C]">{{ $t('注：该功能为内测阶段，可能存在不稳定情况') }}</p>
    <el-row justify="end" class="w-full">
      <el-col :lg="4" :xl="4" :md="12" :xs="12" :sm="12">
        <el-button
          type="primary"
          :disabled="loading"
          size="large"
          @click="emit('handleSubmit', accountQrCode.qr_code_key)"
        >
          {{ $t('下一步') }}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { RCreateAccountFormTip } from '@/constant/release'
import { EAccountSettingStatus } from '@/enum/release'
import type { ICreateAccountRes } from '@/interface/release'
import { $notnull } from '@/utils/help'
import { computed, ref } from 'vue'

const props = defineProps<{
  accountQrCode: ICreateAccountRes
  loading: boolean
  createStatus: EAccountSettingStatus
  isCode: boolean
}>()
const emit = defineEmits(['handleSubmit', 'handleSubmitCode'])

const code = ref('')
const url = computed(() => ($notnull(props.accountQrCode) ? props.accountQrCode.qr_code : ''))

const handleSubmitCode = () => {
  if (!code.value) return
  emit('handleSubmitCode', code.value)
}
</script>
