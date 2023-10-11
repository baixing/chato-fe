<template>
  <el-dialog
    v-model="internalVisible"
    :title="$t(`查看示例`)"
    :width="isMobile ? '90%' : internalDialogWidth"
  >
    <img :src="img" class="w-full" alt="" />
  </el-dialog>
</template>

<script setup lang="ts">
import { useBasicLayout } from '@/composables/useBasicLayout'
import { computed } from 'vue'

const { isMobile } = useBasicLayout()

const props = defineProps<{
  visible: boolean
  img: string
  dialogDefaultWidth?: string
}>()

const emit = defineEmits(['update:visible'])

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const internalDialogWidth = computed(() => props.dialogDefaultWidth || '40%')
</script>
