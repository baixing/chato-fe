<template>
  <el-dialog
    v-model="internalVisible"
    class="join-modal"
    :show-close="false"
    align-center
    :style="backgroundStyle"
  >
    <JoinForm @submit="internalVisible = false" />
  </el-dialog>
</template>

<script setup lang="ts">
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
</script>

<style lang="scss">
.join-modal {
  width: 300px;
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
  }
}
</style>
