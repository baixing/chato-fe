<template>
  <p
    v-show="internalVisible"
    class="text-xs py-2 text-[#9DA3AF] flex items-center justify-center gap-2"
  >
    <el-icon class="animate-spin"><Loading /></el-icon>
    {{ $t('加载中...') }}
  </p>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const internalVisible = computed(() => props.visible)
</script>
