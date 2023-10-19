<template>
  <div class="w-full">
    <div class="flex justify-start items-center text-[#303133] font-medium text-sm mb-3">
      <el-icon><Setting /></el-icon>
      <span class="ml-1">{{ $t('功能说明') }}</span>
    </div>
    <p
      v-for="item in REmpowerAppletIllustrate"
      :key="item"
      class="text-[#596780] mb-2 text-xs"
      v-html="$t(item)"
    />
    <div class="flex justify-start items-center text-[#303133] font-medium text-sm mb-3">
      <el-icon><Warning /></el-icon>
      <span class="ml-1">{{ $t('使用须知') }}</span>
    </div>
    <p
      v-for="item in REmpowerAppletUseInstruction"
      :key="item"
      class="text-[#596780] mb-2 text-xs"
      v-html="$t(item)"
    />
    <el-row justify="end" class="mt-3">
      <el-col :lg="6" :xl="6" :md="12" :xs="12" :sm="12">
        <el-button size="large" type="primary" @click="emit('handleEmpower')">
          {{ $t('同意并授权') }}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { REmpowerAppletIllustrate, REmpowerAppletUseInstruction } from '@/constant/release'

const emit = defineEmits(['handleEmpower'])
</script>
