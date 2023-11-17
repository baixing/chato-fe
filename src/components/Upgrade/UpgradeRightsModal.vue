<template>
  <Modal v-model:visible="upgradeRightsVisible" :footer="false" title="升级版本">
    <div class="text-center text-sm leading-4 text-[#596780]">
      <div
        v-for="(item, index) in SpaceRightsLimitTips[upgradeRightsType]"
        :key="`rights-tip-${index}`"
        class="mb-2"
      >
        {{ $t(item) }}
      </div>
      <el-link
        v-if="isMobile"
        :underline="false"
        type="primary"
        class="mt-6"
        href="https://admin.sdlian.cn/l/ZkjRKDiEcb"
      >
        {{ $t('联系客服') }}
      </el-link>
      <img v-else class="w-[400px] mt-6 mx-auto" src="@/assets/img/lock-crcode.png" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { SpaceRightsLimitTips } from '@/constant/space'
import { useSpaceStore } from '@/stores/space'
import { storeToRefs } from 'pinia'

const { isMobile } = useBasicLayout()
const spaceStoreI = useSpaceStore()

const { upgradeRightsVisible, upgradeRightsType } = storeToRefs(spaceStoreI)
</script>
