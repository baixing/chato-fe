<template>
  <Modal width="40%" mobile-width="95%" title="编辑用户" :footer="false" v-model:visible="visible">
    <EnterMobileForm
      :id="editItem.id"
      :mobile="editItem.mobile"
      :remark="editItem.remark"
      @handleClose="visible = false"
      @handleSubmit="handleEditSubmit"
    />
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EnterMobileForm from './EnterMobileForm.vue'
import type { IMobileLimitItem } from '@/interface/release'

const emit = defineEmits(['update:value', 'handleEditSubmit'])
const props = defineProps<{
  value: boolean
  editItem: IMobileLimitItem
}>()

const visible = computed({
  get: () => props.value,
  set: (val) => {
    emit('update:value', val)
  }
})

const handleEditSubmit = (item: IMobileLimitItem) => {
  emit('handleEditSubmit', item)
  visible.value = false
}
</script>

<style scoped></style>
