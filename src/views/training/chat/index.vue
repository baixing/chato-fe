<template>
  <div class="bg-white h-full max-h-[calc(100%-56px)]">
    <div class="h-full mx-auto !px-[18%] lg:!px-4 flex flex-col">
      <BotProgress />
      <DebugChat class="flex-1 overflow-y-auto" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { DebugDomainSymbol } from '@/constant/domain'
import { useDomainStore } from '@/stores/domain'
import { storeToRefs } from 'pinia'
import { provide } from 'vue'
import BotProgress from './components/BotProgress.vue'
import DebugChat from './components/DebugChat.vue'

const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)

provide(DebugDomainSymbol, domainInfo)
</script>
