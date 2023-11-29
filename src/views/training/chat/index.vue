<template>
  <div class="bg-white h-[calc(100%-56px)]">
    <DebugChat class="h-full mx-auto !px-[18%] lg:!px-4" />
  </div>
</template>

<script setup lang="ts">
import { DebugDomainSymbol } from '@/constant/domain'
import { useDomainStore } from '@/stores/domain'
import { storeToRefs } from 'pinia'
import { provide } from 'vue'
import DebugChat from './components/DebugChat.vue'

const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)

provide(DebugDomainSymbol, domainInfo)
</script>
