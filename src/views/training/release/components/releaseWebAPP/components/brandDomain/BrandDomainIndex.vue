<template>
  <el-drawer
    ref="drawerRef"
    v-model="visible"
    :title="$t(`域名部署`)"
    :before-close="() => emit('update:value', false)"
    class="create-drawer-container"
    :size="isMobile ? '100%' : '40%'"
  >
    <Agreement v-if="step === 1" @nextClick="(i: number) => step = i" />
    <CnameSet
      :status="brandDomainStatus"
      :brandDomainInfo="brandDomainInfo"
      :slug="slug"
      v-if="step === 2"
      @handleSubmitSuccess="getBrandDomainList"
      @nextClick="(i: number) => step = i"
    />
    <Examine v-if="step === 3" @nextClick="step = 1" :brandDomainInfo="brandDomainInfo" />
    <DomainDetail
      v-if="step === 4"
      :brandDomainInfo="brandDomainInfo"
      @nextClick="(i: number) => step = i"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import { getCommonGraph } from '@/api/graph'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { EBrandCreateEditStatusType, EBrandDomainStatusType } from '@/enum/domain'
import type { IBrandDomainTypeKeyFile } from '@/interface/release'
import { computed, ref, watch } from 'vue'
import Agreement from './components/Agreement.vue'
import CnameSet from './components/CnameSet.vue'
import DomainDetail from './components/DomainDetail.vue'
import Examine from './components/Examine.vue'

const emit = defineEmits(['update:value'])
const props = defineProps<{
  value: boolean
  slug: string
}>()
const { isMobile } = useBasicLayout()

const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
const brandDomainStatus = ref<EBrandCreateEditStatusType>(EBrandCreateEditStatusType.create)
const brandDomainList = ref<IBrandDomainTypeKeyFile[]>([])
const brandDomainInfo = ref<IBrandDomainTypeKeyFile>()
const step = ref<number>(1)

const getBrandDomainList = async () => {
  const res = await getCommonGraph<IBrandDomainTypeKeyFile[]>('custom_host', {
    filter: `domain_slug=="${props.slug}"`
  })
  // getBrandDomain(props.slug)
  brandDomainList.value = res.data.data
  if (brandDomainList.value.length) {
    try {
      const resDomainInfo = brandDomainList.value[0]
      brandDomainInfo.value = {
        ...resDomainInfo,
        pri_key: JSON.parse(resDomainInfo.pri_key as string),
        pub_key: JSON.parse(resDomainInfo.pub_key as string)
      }
      step.value = brandDomainInfo.value.s_status === EBrandDomainStatusType.normal ? 4 : 3
    } catch (e) {}
  } else {
    step.value = 1
  }
}

watch(
  () => props.value,
  (v) => {
    v && getBrandDomainList()
  }
)
</script>
