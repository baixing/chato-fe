<template>
  <Modal v-model:visible="internalVisible" title="留下联系方式" :footer="false">
    <CustomerForm :id="internalFormId" :uid="internalUid" @cancel="onClose" @success="onClose" />
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import { computed } from 'vue'
import CustomerForm from './CustomerForm.vue'

const props = defineProps<{
  visible: boolean
  formId: string
  uid: string
}>()

const emit = defineEmits(['update:visible'])

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible')
})

const internalFormId = computed(() => props.formId)
const internalUid = computed(() => props.uid)

const onClose = () => {
  internalVisible.value = false
}
</script>
