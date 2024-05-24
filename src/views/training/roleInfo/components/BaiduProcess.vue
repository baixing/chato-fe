<template>
  <div
    v-if="processLimit.includes(props.status)"
    class="flex justify-center items-center absolute z-[999] top-0 text-[] left-0 w-full h-full bg-white/75"
  >
    <el-result
      :icon="iconStatus[props.status] || 'success'"
      :title="statusText"
      sub-title="请注意，百度智能体的修改仅限一次，当前版本不支持重复修改。"
    >
      <template #icon>
        <el-icon v-if="props.status === EDomainStatus.processing"><Loading /></el-icon>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { processLimit } from '@/constant/domain'
import { EDomainStatus } from '@/enum/domain'
import { computed } from 'vue'

const props = defineProps<{
  status: EDomainStatus
}>()

const iconStatus = {
  [EDomainStatus.processing]: undefined,
  [EDomainStatus.processFail]: 'error',
  [EDomainStatus.processSuccess]: 'success'
}

const statusText = computed(() => {
  switch (props.status) {
    case EDomainStatus.processing:
      return '审核中···'
    case EDomainStatus.processFail:
      return '审核失败！修改资料未通过审核！请联系销售'
    case EDomainStatus.processSuccess:
      return '审核成功···'
    default:
      return '审核中···'
  }
})
</script>
