<template>
  <div class="flex flex-col justify-center items-center w-full text-[#3D3D3D]">
    <p class="mb-[25px] text-[28px] font-medium">{{ $t('使用微信扫码登录') }}</p>
    <p class="text-sm">{{ $t('新用户扫码后，关注公众号自动创建账号') }}</p>
    <ABTestRender :case-num="4">
      <template #viewA> </template>
      <template #viewB>
        <p class="text-sm">（{{ $t('免费使用一年 赠送100电力值') }}）</p>
      </template>
    </ABTestRender>
    <div class="relative w-[208px] h-[208px] rounded-lg mt-10 mb-4" v-loading="loading">
      <img :src="url" :class="['w-full h-full', timeout ? 'opacity-5' : '']" />
      <el-button
        v-if="timeout"
        link
        type="primary"
        size="large"
        class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] !text-[16px]"
        @click="emit('handleRefresh')"
      >
        {{ $t('刷新') }}
      </el-button>
    </div>
    <p class="text-lg">{{ $t('微信扫一扫') }}</p>
  </div>
</template>

<script setup lang="ts">
import ABTestRender from '@/components/ABTestRender/index.vue'

defineProps<{
  url: string
  timeout: boolean
  loading: boolean
}>()

const emit = defineEmits(['handleRefresh'])
</script>

<style scoped></style>
