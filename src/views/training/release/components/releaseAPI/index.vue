<template>
  <div>
    <p class="text-lg text-[#303133] font-medium">{{ $t('API调用') }}</p>
    <p class="mt-3 text-[#9DA3AF] text-xs">
      {{ $t('用户在此链接可以直接和您的机器人聊天') }}
      <a :href="wssApiDocs" target="__blank" class="text-[#409EFF]">
        「 {{ $t('查看接口文档') }} 」
      </a>
    </p>
    <div class="mt-6" v-for="item in configAPIList" :key="item.label">
      <p class="text-[#596780] font-medium">{{ item.label }}</p>
      <div class="mt-3 flex md:flex-col md:items-start justify-start items-center gap-5 md:gap-3">
        <div
          class="text-[#9DA3AF] rounded-md pl-6 pr-8 py-2 w-[500px] md:w-full h-9"
          style="border: 1px solid #e4e7ed"
        >
          {{ item.url }}
        </div>
        <div
          class="h-9 flex justify-center items-center px-3 rounded-md text-[#303133] text-xs cursor-pointer"
          @click="$copyText(item.url)"
          style="border: 1px solid #e4e7ed"
        >
          <el-icon :size="15" class="mr-[6px] mt-[-2px]"><CopyDocument /></el-icon>
          {{ $t('复制') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDomainStore } from '@/stores/domain'

const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)

const wssApiDocs =
  'https://apifox.com/apidoc/shared-74401769-7cc9-4d75-a57e-892dc6aa5960/api-95610185'

const configAPIList = [
  {
    label: 'Token',
    url: domainInfo.value.token
  },
  {
    label: '机器人标识',
    url: domainInfo.value.slug
  }
]
</script>

<style scoped></style>
