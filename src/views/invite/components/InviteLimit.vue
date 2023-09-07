<template>
  <div class="px-[30px] py-9">
    <p class="text-[#596780] text-sm text-center mb-3">
      {{ $t('该空间人员已满，暂时无法加入') }}
    </p>
    <div v-if="authToken">
      <p class="text-[#9DA3AF] text-xs text-center mb-6">
        {{ $t('如有问题，请联系邀请者，或选择进入以下空间：') }}
      </p>
      <SpaceIntoList />
    </div>
    <p class="text-[#9DA3AF] text-xs text-center" v-else>
      {{ $t('如有问题，请联系邀请者，或点击')
      }}<el-link href="/" type="primary" class="text-xs">Chato</el-link>{{ $t('创建自己的空间') }}
    </p>
  </div>
</template>
<script setup lang="ts">
import SpaceIntoList from '@/components/Space/SpaceIntoList.vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)
</script>
