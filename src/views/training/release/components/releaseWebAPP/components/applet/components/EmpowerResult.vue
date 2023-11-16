<template>
  <div class="w-full text-center">
    <div class="flex justify-center items-center text-[#67C23A] text-sm mb-4 font-medium">
      <el-icon size="18"><CircleCheckFilled /></el-icon>
      <span class="ml-[6px]">{{ $t('授权成功，请等待微信审核结果') }}</span>
    </div>
    <p class="text-[#596780]">{{ $t('审核通过后，即可通过小程序与机器人对话') }}</p>
    <el-row justify="end" class="mt-3">
      <el-col :lg="4" :xl="4" :md="12" :xs="12" :sm="12">
        <el-button size="large" type="primary" @click="emit('handleView')">
          {{ $t('查看') }}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['handleView'])
</script>
