<template>
  <Topbar :title="$t('私域运营')" class="!mb-2" />
  <ContentLayout>
    <div class="text-sm text-slate-500 flex items-end justify-between">
      {{ $t('您可以通过创建运营活动来触发定时推送，帮助您运营私域。') }}
      <el-button :icon="Plus" type="primary" @click="drawerVisible = true">
        {{ $t('创建活动') }}
      </el-button>
    </div>
    <div v-loading="initing">
      <template v-if="activityList.length">
        <div
          class="mt-4 grid grid-cols-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4"
        >
          <div
            v-for="item in activityList"
            :key="item.id"
            class="card-container space-y-3 p-4"
            @click="onLinkActivityMessage(item)"
          >
            <p class="flex gap-2 items-center overflow-hidden">
              <ActivityAvatar />
              <span class="truncate font-medium text-base leading-none flex-1">
                {{ item.name }}
              </span>
              <IconBtn :icon="Delete" @click="onDelActivity(item)" class="hover:!text-[#f56c6c]">
                {{ $t('删除') }}
              </IconBtn>
            </p>
            <p class="activity-info">
              <span>{{ $t('触发时间') }}</span>
              <span>{{ dayjs(item.send_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
            </p>
            <p class="activity-info">
              <span>{{ $t('企微托管账户') }}</span>
              <span>{{ item.additions.wx_user_id }}</span>
            </p>
            <p class="activity-info flex-wrap">
              <span>{{ $t('推送用户标签') }}</span>
              <template v-if="item.additions.wx_tags?.length">
                <el-tag
                  v-for="tItem in item.additions.wx_tags"
                  :key="tItem.id"
                  type="warning"
                  effect="light"
                  round
                  class="!whitespace-pre-wrap !h-fit !py-[2px] !px-[6px] !leading-[14px]"
                >
                  {{ tItem.name }}
                </el-tag>
              </template>
              <el-tag
                v-else
                type="warning"
                effect="light"
                round
                class="!whitespace-pre-wrap !h-fit !py-[2px] !px-[6px] !leading-[14px]"
              >
                {{ $t('全部') }}
              </el-tag>
            </p>
            <p class="activity-info">
              <span>{{ $t('推送用户总数') }}</span>
              <span>{{ item.total }}</span>
            </p>
            <p class="activity-info">
              <span>{{ $t('活动机器人') }} </span>
              <span v-if="item.additions.domain" class="flex items-center gap-2 overflow-hidden">
                <Avatar
                  :avatar="item.additions.domain.avatar || DefaultAvatar"
                  :size="24"
                  :name="item.additions.domain.name[0]"
                />
                <span class="truncate">{{ item.additions.domain.name }}</span>
              </span>
              <span v-else>{{ $t('机器人不存在') }}</span>
            </p>
          </div>
        </div>
        <div
          v-show="!initing && pagination.page !== pagination.page_count"
          class="flex justify-center mt-4"
        >
          <el-button plain round :loading="loading" @click="onMore">
            {{ $t('查看更多') }}
          </el-button>
        </div>
      </template>
      <el-empty v-else />
    </div>
  </ContentLayout>
  <ActivityDrawer v-model:visible="drawerVisible" @success="initActivityList" />
</template>

<script setup lang="ts">
import { deleteActivity, getActivityList } from '@/api/activity'
import DefaultAvatar from '@/assets/img/avatar.png'
import IconBtn from '@/components/IconBtn/index.vue'
import Topbar from '@/components/Topbar/index.vue'
import type { IActivity } from '@/interface/activity'
import type { IPage } from '@/interface/common'
import ContentLayout from '@/layout/ContentLayout.vue'
import { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { Delete, Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElMessageBox, ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ActivityAvatar from './components/ActivityAvatar.vue'
import ActivityDrawer from './components/ActivityDrawer.vue'

const { t } = useI18n()
const router = useRouter()

const initing = ref(false)
const loading = ref(false)
const pagination = reactive<IPage>({
  page: 1,
  page_count: 1
})
const activityList = ref<IActivity[]>([])
const drawerVisible = ref(false)
const base = useBase()
const { userInfo } = storeToRefs(base)

const onDelActivity = async (row: IActivity) => {
  try {
    await ElMessageBox.confirm(t('删除后将立即生效，此操作无法撤销。'), t('确认删除'), {
      confirmButtonText: t('确认'),
      cancelButtonText: t('取消'),
      type: 'warning'
    })
    await deleteActivity(row.id)
    ElNotification.success(t('删除成功'))
    initActivityList(1)
  } catch (e) {}
}

const onLinkActivityMessage = (row: IActivity) => {
  router.push({ name: RoutesMap.activity.message, params: { activityId: row.id } })
}

const onMore = () => {
  if (pagination.page === pagination.page_count) {
    return
  }
  pagination.page++
}

const initActivityList = async (page = 1) => {
  try {
    loading.value = true
    const {
      data: { data, pagination: paginationRes }
    } = await getActivityList({ page, page_size: 10 })
    //  getCommonGraph<IActivity[]>('send_schedule_group', {
    //   filter: `org_id=="${userInfo.value.org.id}"`,
    //   page,
    //   size: 10
    // })
    activityList.value = page === 1 ? data : activityList.value.concat(data)
    pagination.page_count = paginationRes.page_count
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const init = async () => {
  try {
    initing.value = true
    await initActivityList()
  } catch (e) {
  } finally {
    initing.value = false
  }
}

init()

watch(
  () => pagination.page,
  (v) => {
    initActivityList(v)
  }
)
</script>

<style lang="scss" scoped>
.card-container {
  @apply bg-white rounded-lg min-h-[96px] transition cursor-pointer h-full hover:shadow-[0_11px_19px_0px_rgba(44,43,72,0.14)] lg:p-4 lg:h-auto;
}

.activity-info {
  @apply text-zinc-600 text-sm flex gap-2 items-center;

  span:first-child {
    @apply text-slate-500;
  }
}
</style>
