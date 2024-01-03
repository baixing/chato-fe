<template>
  <el-menu
    :default-active="internalActiveMenu"
    :ellipsis="false"
    mode="horizontal"
    @select="(v) => emit('select', v)"
    class="font-medium space-x-2 horizontal-menu"
    :style="{
      '--el-menu-horizontal-height': `${height}px`
    }"
  >
    <el-menu-item v-for="item in menus" :key="item.routeName" :index="item.routeName">
      {{ $t(item.title) }}
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import type { IMenuItem } from '@/interface/common'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    active: string
    menus: IMenuItem[]
    height?: number
  }>(),
  {
    active: '',
    height: 61
  }
)

const emit = defineEmits(['select'])

const internalActiveMenu = computed(() => props.active)
</script>

<style lang="scss" scoped>
.horizontal-menu {
  --el-menu-bg-color: #fff;
  --el-menu-text-color: #303133;
  --el-menu-hover-bg-color: transparent;
  --el-menu-hover-text-color: #7c5cfc;
  --el-menu-active-color: #7c5cfc;
  --el-menu-base-level-padding: 16px;
  --el-menu-border-color: #e4e7ed;
}
</style>
