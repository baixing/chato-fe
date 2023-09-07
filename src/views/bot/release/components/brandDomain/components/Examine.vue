<template>
  <div class="examine-container p-40px pt-[200px] md:pt-[100px] text-x]">
    <div v-if="brandDomainInfo.s_status === brandDomainStatusType.refuse" class="text-center">
      <p class="text-xl text-[#EA0000] flex items-center justify-center">
        <svg-icon name="brandDomain-error" class="mr-1"></svg-icon>{{ $t(' 审核失败') }}
      </p>
      <p class="text-center">{{ brandDomainInfo.memo }}</p>
      <el-button type="primary" link @click="emit('nextClick')">{{ $t('重新部署') }}</el-button>
    </div>
    <div class="w-full text-xs" v-else>
      <p class="text-base text-[#303133] flex justify-center items-center">
        <svg-icon name="brandDomain-success"></svg-icon>
        <span class="ml-[6px]">{{ $t('资料审核中') }}</span>
      </p>
      <p>
        {{ $t('绑定域名的审核将会在')
        }}<span class="text-[#596780]">{{ $t('1个工作日内完成') }}</span
        >，
      </p>
      <p>{{ $t('域名审核过程中，请勿随意修改所有配置项，') }}</p>
      <p class="mb-[30px]">{{ $t('否则可能导致网页无法访问等情况。') }}</p>
      <p>
        {{ $t('域名审核成功后，原来的网页链接会自动切换为新的域名地址，') }}
      </p>
      <p>{{ $t('通过访问绑定的独立域名地址可直接进入网页。') }}</p>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { brandDomainStatusType } from '@/enum/domain'
import type { brandDomainTypeKeyFile } from '@/interface/release'
import { watch } from 'vue'

const emit = defineEmits(['nextClick'])
const props = defineProps<{
  brandDomainInfo: brandDomainTypeKeyFile
}>()
watch(
  () => props.brandDomainInfo,
  (e) => {
    console.log(e)
  },
  { immediate: true }
)
</script>
<style lang="scss" scoped>
.examine-container {
  p {
    text-align: center;
    margin-bottom: 12px;
  }
}
</style>
