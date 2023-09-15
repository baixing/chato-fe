<template>
  <Modal
    v-model:visible="internalVisible"
    :width="300"
    :mobile-width="300"
    :show-close="false"
    align-center
    :style="backgroundStyle"
    class="join-modal"
  >
    <JoinForm @submit="onClose" />
    <el-icon
      :size="20"
      class="!absolute top-2 right-2 cursor-pointer hover:opacity-80"
      @click="onClose"
    >
      <Close />
    </el-icon>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import useImagePath from '@/composables/useImagePath'
import { computed } from 'vue'
import JoinForm from './JoinForm.vue'
const { ImagePath } = useImagePath('invest-modal-bg', 'home')
const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['update:visible'])

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${ImagePath.value})`
}))

const onClose = () => {
  internalVisible.value = false
}
</script>

<style lang="scss">
.join-modal {
  height: 515px;
  border-radius: 16px;
  overflow: hidden;
  background-color: #fff;
  background-position: center top;
  background-size: 300px 368px;
  background-repeat: no-repeat;

  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding-top: 140px;
    position: relative;
  }
}
</style>
