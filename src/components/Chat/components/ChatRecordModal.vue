<template>
  <Modal
    v-model:visible="visible"
    :title="$t('投喂记录')"
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
      <li>{{ $t('投喂') }}{{ index + 1 }}：</li>
      <li>
        <p>{{ $t('订单号') }}</p>
        <p class="text-[#9DA3AF]">{{ item.biz_id }}</p>
      </li>
      <li>
        <p>{{ $t('订单时间') }}</p>
        <p class="text-[#9DA3AF]">{{ dayjs(item.created).format('YYYY-MM-DD HH:mm:ss') }}</p>
      </li>
      <li>
        <p>{{ $t('付款金额') }}</p>
        <p class="text-[#9DA3AF]">
          {{ $t('{count}元', { count: (item.package.price / 100).toFixed(2) }) }}
        </p>
      </li>
    </ul>
    <span v-if="!buyOrderInfo.length"> {{ $t('暂无投喂记录') }} </span>
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
