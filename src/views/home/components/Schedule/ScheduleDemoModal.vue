<template>
  <Modal
    v-model:visible="internalVisible"
    :width="300"
    :mobile-width="300"
    :show-close="false"
    align-center
    :style="backgroundStyle"
    class="schedule-modal"
  >
    <ScheduleForm :submit-btn-text="$t(`立即预约`)" @submit="onClose" />
    <el-icon
      :size="20"
      class="!absolute top-2 right-2 cursor-pointer hover:opacity-80"
      @click="onClose"
    >
      <Close />
    </el-icon>
  </Modal>
</template>
<script lang="ts" setup>
import Modal from '@/components/Modal/index.vue'
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

const onClose = () => {
  internalVisible.value = false
}
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
    position: relative;
  }
}
</style>
