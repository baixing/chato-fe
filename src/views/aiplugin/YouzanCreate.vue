<template>
  <div class="w-full">
    <Topbar title="有赞商品" class="!mb-0 lg:!mb-4" />
    <div class="mt-8 pb-8 px-16 w-full" v-loading="loading">
      <el-table :data="tableList" style="width: 100%">
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="date" label="商品logo" align="center" width="120">
          <template #default="{ row }">
            <a :href="row.detail_url" target="_blank" class="flex justify-center">
              <img class="w-[50px] h-auto" :src="row.image" alt="" />
            </a>
          </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" label="商品" align="center">
          <template #default="{ row }">
            <a :href="row.detail_url" target="_blank">
              {{ row.title }}
            </a>
          </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" label="创建时间" align="center" width="180">
          <template #default="{ row }">
            {{ dayjs(row.created_time).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" align="center" width="150">
          <template #header>
            <div class="flex justify-center items-center text-[#909399]">
              <SLTitle tips="如需管理机器人请前往 训练中心 -> 我的机器人 -> 更多">操作</SLTitle>
            </div>
          </template>
          <template #default="{ row }">
            <el-row>
              <el-col v-if="!row.chato_domain">
                <el-popconfirm
                  width="250"
                  confirm-button-text="确认"
                  cancel-button-text="取消"
                  title="温馨提示：完整客服系统的创建预计需要两分钟时间，请您耐心等待。感谢您的理解与耐心！"
                  @confirm="onCreateYouzanRobot(row)"
                >
                  <template #reference>
                    <el-button type="primary" link> 创建客服 </el-button>
                  </template>
                </el-popconfirm>
              </el-col>
              <el-col v-else>
                <el-button type="primary" link @click="onHandleNavitorRobot(row.chato_domain)">
                  机器人
                </el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-5 flex justify-end" v-if="pageInfo.total > 20">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :page-size="pageInfo.size"
          :total="pageInfo.total"
          v-model:current-page="pageInfo.page"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createYouzanRobot, getYouzanProductList } from '@/api/yz'
import SLTitle from '@/components/Title/SLTitle.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import type { IYouzanProducts } from '@/interface/yz'
import { RoutesMap } from '@/router'
import { useYouzanStore } from '@/stores/yz'
import { $notnull } from '@/utils/help'
import dayjs from 'dayjs'
import { ElLoading, ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const youzanStore = useYouzanStore()
const { isMobile } = useBasicLayout()
const { youzanInfo } = storeToRefs(youzanStore)
const tableList = ref<IYouzanProducts[]>()
const loading = ref(false)
const pageInfo = reactive({
  page: 1,
  size: 20,
  total: 0
})

const init = async () => {
  loading.value = true
  const {
    data: { data }
  } = await getYouzanProductList(youzanInfo.value.additions.kdt_id, pageInfo.page, pageInfo.size)
  pageInfo.total = data.count
  tableList.value = data.items
  loading.value = false
}

// 创建有赞机器人
const onCreateYouzanRobot = async (item: IYouzanProducts) => {
  const loading = ElLoading.service({
    lock: true,
    text: '创建中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    await createYouzanRobot(youzanInfo.value.additions.kdt_id, item.alias)
    ElNotification.success('创建成功')
    // router.replace({
    //   name: RoutesMap.manager.center
    // })
    init()
  } catch (error) {
  } finally {
    loading.close()
  }
}

// 前往有赞机器人
const onHandleNavitorRobot = async (domain_id: number) => {
  router.replace({
    name: RoutesMap.tranning.roleInfo,
    params: {
      botId: domain_id
    }
  })
}

watch(() => pageInfo.page, init)

$notnull(youzanInfo.value) && init()
</script>

<style scoped></style>
