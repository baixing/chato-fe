<template>
  <div class="w-full">
    <el-dropdown class="w-full" trigger="click" placement="bottom" max-height="300">
      <div
        class="h-[40px] w-full px-[16px] border border-solid rounded-sm border-[#D8D8D8] flex justify-between items-center"
      >
        <div class="w-full h-full flex items-center">
          <template v-if="$notnull(currentSelect)">
            <Avatar
              :avatar="currentSelect.avatar"
              :size="32"
              :name="currentSelect.name.slice(0, 2)"
              class="w-[32px] h-[32px] mr-[8px] rounded-full"
            />
            <span>{{ currentSelect.name }}</span>
          </template>
          <span v-else class="text-[#CFD3DC]">{{ placeholder }}</span>
        </div>
        <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </div>
      <el-icon class="el-icon--right"><arrow-down /></el-icon>
      <template #dropdown>
        <el-dropdown-menu class="w-full">
          <el-dropdown-item
            class="w-full flex justify-start items-center"
            @click="currentSelect = item"
            v-for="item in list"
            :key="item.name"
          >
            <Avatar
              :avatar="item.avatar"
              :size="32"
              :name="item.name.slice(0, 2)"
              class="w-[32px] h-[32px] mr-[8px] rounded-full"
            />
            <span>{{ item.name }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import type { IDomainInfo } from '@/interface/domain'
import { $notnull } from '@/utils/help'
import { computed } from 'vue'

const emit = defineEmits(['update:value'])
const props = withDefaults(
  defineProps<{
    value: IDomainInfo
    list: IDomainInfo[]
    placeholder: string
  }>(),
  {
    placeholder: ''
  }
)

const currentSelect = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
</script>
