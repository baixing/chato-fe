<template>
  <div class="flex justify-center items-center mb-[24px] text-[#67C23A] text-sm">
    <svg-icon name="selected-circle" class="mr-1 !w-[20px] !h-[20px]"></svg-icon>
    <span class="ml-[8px]">{{ $t('绑定成功，快去创建聊天吧') }}</span>
  </div>
  <p class="create-account-title">{{ $t('注意事项') }}</p>
  <p class="mb-[10px] text-[#596780] text-xs" v-for="item in RCreateAccountSuccessTip" :key="item">
    {{ $t(item) }}
  </p>
  <el-row justify="end" class="w-full" :gutter="20">
    <el-col :lg="6" :xl="6" :md="12" :xs="12" :sm="12">
      <el-button size="large" @click="emit('handleClose')">{{ $t('以后再说') }}</el-button>
    </el-col>
    <el-col :lg="6" :xl="6" :md="12" :xs="12" :sm="12">
      <el-button type="primary" size="large" @click="emit('handleCreateChat')">
        {{ $t('去创建聊天') }}
      </el-button>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { RCreateAccountSuccessTip } from '@/constant/release'

const emit = defineEmits(['handleCreateChat', 'handleClose'])
</script>
