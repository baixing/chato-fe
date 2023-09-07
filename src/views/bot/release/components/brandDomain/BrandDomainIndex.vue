<template>
  <el-drawer
    ref="drawerRef"
    v-model="visible"
    :title="$t(`域名部署`)"
    :before-close="() => emit('update:value', false)"
    class="create-drawer-container"
    :size="isMobile ? '100%' : '40%'"
  >
    <Agreement v-if="index === 1" @nextClick="(i: number) => emit('handleIndex', i)" />
    <CnameSet
      :status="status"
      :brandDomainInfo="brandDomainInfo"
      :slug="slug"
      v-if="index === 2"
      @handleSubmitSuccess="emit('handleSubmitSuccess')"
      @nextClick="(i: number) => emit('handleIndex', i)"
    />
    <Examine
      v-if="index === 3"
      @nextClick="emit('handleIndex', 1)"
      :brandDomainInfo="brandDomainInfo"
    />
    <DomainDetail
      v-if="index === 4"
      :brandDomainInfo="brandDomainInfo"
      @nextClick="(i: number) => emit('handleIndex', i)"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import { useBasicLayout } from '@/composables/useBasicLayout'
import type { brandCreateEditStatusType } from '@/enum/domain'
import type { brandDomainTypeKeyFile } from '@/interface/release'
import { computed } from 'vue'
import Agreement from './components/Agreement.vue'
import CnameSet from './components/CnameSet.vue'
import DomainDetail from './components/DomainDetail.vue'
import Examine from './components/Examine.vue'

const emit = defineEmits(['update:value', 'handleIndex', 'handleSubmitSuccess'])
const props = defineProps<{
  value: boolean
  index: number
  slug: string
  status: brandCreateEditStatusType
  brandDomainInfo: brandDomainTypeKeyFile
}>()
const { isMobile } = useBasicLayout()

const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
</script>
