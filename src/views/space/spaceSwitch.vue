<template>
  <BlankWithChatoLayout>
    <div class="px-[30px] py-9">
      <p class="text-[#596780] text-sm text-center mb-3">
        {{ $t('已从该空间退出，无法进入该空间') }}
      </p>
      <p class="text-[#9DA3AF] text-xs text-center mb-6">
        {{ $t('可选择进入以下空间：') }}
      </p>
      <SpaceIntoList />
    </div>
    <template #footer>
      <p class="text-xs mt-4 text-[#9DA3AF]">
        {{ $t('进入后，在右上角账户中心里可切换不同空间') }}
      </p>
    </template>
  </BlankWithChatoLayout>
</template>

<script setup lang="ts">
import SpaceIntoList from '@/components/Space/SpaceIntoList.vue'
import BlankWithChatoLayout from '@/layout/BlankWithChatoLayout.vue'
</script>
