<template>
  <el-popover
    v-model:visible="popoverVisible"
    placement="right"
    :width="280"
    trigger="click"
    :show-arrow="false"
  >
    <template #reference>
      <div class="cursor-pointer w-full rounded-lg border border-solid border-[#394457] px-2 py-3">
        <div class="flex items-center gap-2 text-[#B5BED0] mb-4">
          <Avatar
            :avatar="userInfo.org.avatar"
            :name="$t('空间')"
            :commercial-type="userCommercialType"
            :size="36"
            with-rights
            show-all-name
          />
          <p class="truncate text-xs leading-[18px] pl-2 flex-1">{{ orgInfo.name }}</p>
          <svg-icon name="arrow-expand" svg-class="w-4 h-4 shrink-0" />
        </div>
        <div class="relative bg-[#242B40] rounded-lg overflow-hidden h-1 mb-2">
          <p
            :class="['absolute bg-[#7C5CFC] rounded-lg top-0 left-0 h-1']"
            :style="{ width: spaceQuotaConsumedScale }"
          />
        </div>
        <div class="flex items-center justify-between text-xs leading-4 text-[#596780]">
          <span>{{ $t('电力值') }}</span>
          <span>
            <span class="text-[#7C5CFC]">{{ spaceQuota.consumed }}</span>
            / {{ spaceQuota.total }}
          </span>
        </div>
      </div>
    </template>
    <div class="flex flex-col -mx-3 px-5 flex-1 box-border overflow-hidden">
      <span class="mb-2 text-[#596780]">{{ $t('我的空间') }}</span>
      <div class="flex items-center justify-between">
        <Avatar :avatar="selectedSpace?.org.avatar" :name="$t('空间')" :size="28" show-all-name />
        <div class="space-more ml-2">
          <p class="flex-1 text-[#7c5cfc] truncate text-sm">{{ selectedSpace?.org.name }}</p>
          <el-icon class="!mr-0 !text-[#7c5cfc]">
            <Check />
          </el-icon>
        </div>
      </div>

      <ul
        class="space-list-container flex flex-col gap-4 mt-4 text-[#3D3D3D] text-sm max-h-[76px] -mx-5 px-5 overflow-y-auto"
      >
        <li
          v-for="item in viewSpaceList"
          :key="item.org.id"
          @click="onSelect(item)"
          class="flex items-center justify-between overflow-hidden shrink-0 cursor-pointer space-item"
        >
          <Avatar :avatar="item.org.avatar" :name="$t('空间')" :size="28" show-all-name />
          <span class="flex-1 inline-block truncate ml-2 transition-colors">
            {{ item.org.name }}
          </span>
          <el-icon class="switch-icon">
            <Switch />
          </el-icon>
        </li>
      </ul>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import Avatar from '@/components/Avatar/index.vue'
import useSpace from '@/composables/useSpace'
import type { IUserInfo } from '@/interface/user'
import { useBase } from '@/stores/base'
import { useSpaceStore } from '@/stores/space'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

const baseStoreI = useBase()
const spaceStoreI = useSpaceStore()
const { switchSpace } = useSpace()

const selectedSpace = ref<IUserInfo>()
const popoverVisible = ref(false)

const { userInfo, userCommercialType, orgInfo, orgInfoList } = storeToRefs(baseStoreI)
const { spaceQuota } = storeToRefs(spaceStoreI)

const spaceQuotaConsumedScale = computed(() => {
  const { consumed, total } = spaceQuota.value
  if (!consumed || !total) {
    return '0px'
  }

  const scaleNum = 100 - Number((consumed / total).toFixed(2)) * 100
  return scaleNum > 0 ? `${scaleNum}%` : '0px'
})

const viewSpaceList = computed(() =>
  (orgInfoList.value || []).filter((item) => item?.org?.id !== selectedSpace.value?.org?.id)
)

const onSelect = (item: IUserInfo) => {
  popoverVisible.value = false
  switchSpace(item.org.id)
}

watch(
  [userInfo, orgInfoList],
  ([v1, v2]) => {
    if (v1?.org && v2) {
      selectedSpace.value = orgInfoList.value.find(
        (item) => item.org?.id === userInfo.value.org?.id
      )
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped lang="scss">
.space-more {
  cursor: pointer;
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.space-list-container {
  &::-webkit-scrollbar {
    display: none;
  }
}

.space-item {
  .switch-icon {
    margin-right: 0;
    visibility: hidden;
  }
  &:hover {
    color: var(--el-color-primary);

    .switch-icon {
      visibility: visible;
    }
  }
}
</style>
