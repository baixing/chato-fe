<template>
  <Modal
    v-model:visible="visible"
    :title="$t('套餐信息')"
    mobile-width="85%"
    width="40%"
    :footer="false"
  >
    <ul
      v-loading="loading"
      v-for="(item, index) in buyOrderInfo"
      :key="item.id"
      class="chat-detail-modal w-full text-[#303133] text-sm gap-y-4"
    >
      <li>{{ $t('套餐') }} {{ index + 1 }}：</li>
      <li>
        <p>{{ $t('剩余资源数') }}</p>
        <p class="text-[#9DA3AF]">
          {{
            $t('{count}条', {
              count: item.total - item.consumed > 0 ? item.total - item.consumed : 0
            })
          }}
        </p>
      </li>
      <li>
        <p>{{ $t('剩余天数') }}</p>
        <p class="text-[#9DA3AF]">
          {{ $t('{count}天', { count: dayjs(item.to_time).diff(item.from_time, 'day') }) }}
        </p>
      </li>
      <li>
        <p>{{ $t('套餐资源数') }}</p>
        <p class="text-[#9DA3AF]">{{ $t('{count}条', { count: item.total }) }}</p>
      </li>
      <li>
        <p>{{ $t('套餐时长') }}</p>
        <p class="text-[#9DA3AF]">{{ $t('{count}天', { count: item.package.duration }) }}</p>
      </li>
    </ul>
    <span v-if="!buyOrderInfo.length"> {{ $t('暂无套餐信息') }} </span>
  </Modal>
</template>

<script setup lang="ts">
import type { IDomainInfo } from '@/interface/domain'
import { cuserStore } from '@/stores/cuser'
import { $notnull } from '@/utils/help'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const props = defineProps<{
  value: boolean
  domainInfo: IDomainInfo
}>()

const emit = defineEmits(['update:value'])

const cuser = cuserStore()
const { buyOrderInfo } = storeToRefs(cuser)
const loading = ref(false)

const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})

const initOrderInfo = async () => {
  try {
    loading.value = true
    cuser.getCuserBuyOrderInfo(props.domainInfo.slug)
  } catch (error) {
  } finally {
    loading.value = false
  }
}

visible.value && !$notnull(buyOrderInfo.value) ? initOrderInfo() : null
</script>

<style scoped lang="scss">
.chat-detail-modal {
  li {
    @apply leading-6 mb-1;
  }
}
</style>
