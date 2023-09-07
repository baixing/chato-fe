<template>
  <el-popover
    v-model:visible="popoverVisible"
    placement="right"
    :width="280"
    trigger="click"
    :show-arrow="false"
  >
    <template #reference>
      <div class="flex flex-col gap-3 items-center cursor-pointer">
        <Avatar
          :avatar="userInfo.org.avatar"
          :name="$t('空间')"
          :commercial-type="userCommercialType"
          with-rights
          show-all-name
        />
        <el-button
          plain
          class="!text-[#7C5CFC] !border-[#7C5CFC] !leading-4 !text-xs !rounded-md !px-[10px] box-border !py-[2px] !h-fit !bg-transparent hover:opacity-90 mb-5"
        >
          {{ $t('切换') }}
        </el-button>
      </div>
    </template>
    <div class="flex flex-col -mx-3 px-5 flex-1 box-border overflow-hidden">
      <span class="mb-2 text-[#596780]">{{ $t('我的空间') }}</span>
      <div class="flex items-center justify-between">
        <Avatar :avatar="selectedSpace?.org.avatar" :name="$t('空间')" :size="28" show-all-name />
        <div class="space-more ml-2">
          <p class="flex-1 text-[#7c5cfc] truncate text-sm">{{ selectedSpace?.org.name }}</p>
          <el-icon class="!mr-0 text-[#7c5cfc]">
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
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

const baseStoreI = useBase()
const { switchSpace } = useSpace()

const selectedSpace = ref<IUserInfo>()
const popoverVisible = ref(false)

const { userInfo, userCommercialType, orgInfoList } = storeToRefs(baseStoreI)

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
