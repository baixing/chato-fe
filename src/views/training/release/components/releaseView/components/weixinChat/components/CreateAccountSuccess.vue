<template>
  <div class="flex justify-center items-center mb-[24px] text-[#67C23A] text-sm">
    <svg-icon name="selected-circle" class="mr-1 !w-[20px] !h-[20px]"></svg-icon>
    <span class="ml-[8px]">{{ $t('绑定成功，快去创建聊天吧') }}</span>
  </div>
  <p class="create-account-title">{{ $t('注意事项') }}</p>
  <p class="mb-[10px] text-[#596780] text-xs" v-for="item in RCreateAccountSuccessTip" :key="item">
    {{ $t(item) }}
  </p>
</template>

<script setup lang="ts">
import { RCreateAccountSuccessTip } from '@/constant/release'

const emit = defineEmits(['handleCreateChat', 'handleClose'])
</script>
