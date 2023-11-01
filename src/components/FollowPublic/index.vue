<template>
  <Modal
    width="30%"
    mobile-width="90%"
    v-model:visible="followPublicVisible"
    :title="$t(`关注公众号`)"
    :footer="false"
  >
    <div class="w-full flex justify-start items-center">
      <div style="border: 1px solid #e4e7ed" class="rounded-lg mr-6 md:mr-4">
        <img :src="baixingAI" class="w-[130px] h-[130px] md:w-[75px] md:h-[75px]" alt="" />
      </div>
      <div class="flex flex-col justify-center items-start">
        <p class="text-[#303133] text-base mb-4 md:text-sm">{{ $t('扫码关注「百姓AI」公众号') }}</p>
        <a
          class="theme-color px-4 py-2 rounded"
          style="border: 1px solid #7c5cfc"
          :href="baixingAI"
          download="BaixingAI"
        >
          {{ $t('保存图片') }}
        </a>
        <p class="mt-3 text-[#9DA3AF] text-xs">
          {{ $t('若无法长按识别，请保存后微信扫码') }}
        </p>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import baixingAI from '@/assets/img/home/baixing-ai.png'
import { useSpaceStore } from '@/stores/space'
import { storeToRefs } from 'pinia'

const spaceStore = useSpaceStore()
const { followPublicVisible } = storeToRefs(spaceStore)
</script>
