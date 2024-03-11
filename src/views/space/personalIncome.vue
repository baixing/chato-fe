<template>
  <Topbar :title="$t('我的收益')" class="!mb-0" />
  <ContentLayout class="pt-8">
    <div class="flex justify-between items-center">
      <SLTitle class="text-base" tips="最多可试用10笔订单且总支付金额不能超过300元">
        {{ $t('明细列表') }}
      </SLTitle>
    </div>
    <div class="flex items-center justify-start my-6">
      {{ $t('共计：{count}元', { count: (totalPay / 100).toFixed(2) }) }}
      <el-button type="primary" class="ml-4" :disabled="true" plain>
        {{ $t('提现') }}
      </el-button>
    </div>
    <el-table
      :data="payList"
      style="
        width: 100%;
        height: 100%;

        --el-table-border-color: none;
        --el-table-header-bg-color: #e7e9ee;
        --el-table-bg-color: #f2f3f5;
        --el-table-tr-bg-color: #f2f3f5;
        --el-bg-color: #f2f3f5;
        --el-fill-color-light: #f2f3f5;
        --el-table-header-text-color: #303133;
      "
    >
      <el-table-column prop="biz_id" :label="$t(`订单id`)" width="80" />
      <el-table-column prop="user_uuid" :label="$t(`用户`)" />
      <!-- <el-table-column prop="mobile" :label="$t(`手机号`)" /> -->
      <el-table-column :label="$t(`购买日期`)">
        <template #default="scope">
          <span>{{ dayjs(scope.row.created).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="total" :label="$t(`套餐条数`)" />
      <el-table-column :label="$t(`套餐时长`)">
        <template #default="scope">
          <span>{{ scope.row.package.duration }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="consumed" :label="$t(`已使用`)" />
      <el-table-column :label="$t(`剩余`)">
        <template #default="scope">
          <span>
            {{ scope.row.total - scope.row.consumed }}条；{{
              dayjs(scope.row.to_time).diff(dayjs(scope.row.from_time), 'day')
            }}
            天
          </span>
        </template>
      </el-table-column>
    </el-table>
  </ContentLayout>
</template>

<script setup lang="ts">
import { getPurchaseToBIncome } from '@/api/order'
import type { ICUserBuyProductionDetail } from '@/interface/order'
import ContentLayout from '@/layout/ContentLayout.vue'
// import { useDomainStore } from '@/stores/domain'
import dayjs from 'dayjs'
// import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

// const domainStore = useDomainStore()
// const { domainList } = storeToRefs(domainStore)
const payList = ref<ICUserBuyProductionDetail[]>([])

const totalPay = computed(() => payList.value.reduce((pre, cur) => (pre += cur.package.price), 0))

// const slugString = computed(() => {
//   const list = domainList.value.map((item) => item.slug)
//   const result = list
//     .reduce((pre, cur) => {
//       return pre + `domain_slug=="${cur}" ` + 'or '
//     }, '')
//     .slice(0, -3) // 移除最后一个字符，即多余的逗号
//   return result
// })

const init = async () => {
  //  getPurchaseToBIncome()
  const res = await getPurchaseToBIncome()
  //  getCommonGraph<ICUserBuyProductionDetail[]>(`customer_order`, {
  //   filter: `${slugString.value}`
  // })
  payList.value = res.data.data
}

init()
</script>
