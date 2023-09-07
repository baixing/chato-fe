<template>
  <div
    class="flex flex-col gap-4 max-h-56 overflow-y-scroll space-container"
    v-loading="loading"
    element-loading-background="#f2f3f5"
  >
    <div
      class="p-4 rounded-lg flex items-center justify-between bg-white"
      v-for="(item, index) in orgInfoList"
      :key="`orginfo_${index}`"
    >
      <Avatar :avatar="item.org.avatar" name="空间" :size="32" show-all-name />
      <p class="flex-1 pr-4 truncate break-all text-sm">{{ item.org.name }}</p>
      <el-button plain type="primary" class="bg-white" @click="() => onInto(item)">
        {{ $t('进入') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from '@/components/Avatar/index.vue'
import useSpace from '@/composables/useSpace'
import type { IUserInfo } from '@/interface/user'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const baseStoreI = useBase()
const authStoreI = useAuthStore()
const { orgInfoList } = storeToRefs(baseStoreI)
const { authToken } = storeToRefs(authStoreI)
const { switchSpace } = useSpace()

const loading = ref(false)

const onInto = (item: IUserInfo) => {
  switchSpace(item.org.id)
}

const init = async () => {
  if (!authToken.value) {
    return
  }

  loading.value = true
  try {
    await baseStoreI.getUserInfo()
  } catch (err) {
  } finally {
    loading.value = false
  }
}

init()
</script>

<style lang="scss" scoped>
.space-container {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
