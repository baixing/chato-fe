<template>
  <el-dialog
    v-model="internalVisible"
    :width="300"
    :show-close="false"
    align-center
    class="schedule-modal"
    :style="backgroundStyle"
  >
    <ScheduleForm :submit-btn-text="$t(`立即预约`)" @submit="internalVisible = false" />
  </el-dialog>
</template>
<script lang="ts" setup>
import useImagePath from '@/composables/useImagePath'
import { computed } from 'vue'
import ScheduleForm from './ScheduleForm.vue'
const { ImagePath } = useImagePath('conact-modal-bg', 'home')

const backgroundStyle = computed(() => ({
  background: `url(${ImagePath.value}) center top no-repeat`,
  backgroundSize: '300px 368px'
}))

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['update:visible'])

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})
</script>
<style lang="scss">
.schedule-modal {
  height: 368px;
  border-radius: 16px;
  overflow: hidden;
  background-color: #fff;
  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding-top: 140px;
  }
}
</style>
