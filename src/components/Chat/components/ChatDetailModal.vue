<template>
  <Modal
    v-model:visible="visible"
    :title="$t('关于我')"
    mobile-width="85%"
    width="40%"
    :footer="false"
  >
    <ul class="chat-detail-modal w-full text-[#303133] text-sm gap-y-4">
      <li>
        <p>{{ $t('名称') }}</p>
        <p class="text-[#9DA3AF]">{{ domainInfo.name }}</p>
      </li>
      <li>
        <p>{{ $t('简介') }}</p>
        <p class="text-[#9DA3AF]">{{ domainInfo.desc || '....' }}</p>
      </li>
      <li>
        <p>{{ $t('创作者') }}</p>
        <p class="text-[#9DA3AF]">{{ domainInfo.creator.mobile }}</p>
      </li>
    </ul>
  </Modal>
</template>

<script setup lang="ts">
import type { IDomainInfo } from '@/interface/domain'
import { computed } from 'vue'

const props = defineProps<{
  value: boolean
  domainInfo: IDomainInfo
}>()

const emit = defineEmits(['update:value'])

const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
</script>

<style scoped lang="scss">
.chat-detail-modal {
  li {
    @apply leading-6 mb-1;
  }
}
</style>
