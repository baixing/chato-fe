<template>
  <Modal
    width="50%"
    mobile-width="100%"
    v-model:visible="internalVisible"
    :title="$t(`填写示意图`)"
    :footer="false"
    class="sketch-official-container"
  >
    <img :src="url" class="w-full" alt="" />
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import { computed } from 'vue'

const emit = defineEmits(['update:value'])

const props = defineProps<{
  value: boolean
  url: string
}>()

const internalVisible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})
</script>
<style lang="scss">
.sketch-official-container {
  .el-dialog__header {
    margin-right: 0;
  }
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 24px;
  }
}
</style>
