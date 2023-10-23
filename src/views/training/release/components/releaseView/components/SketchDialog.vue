<template>
  <Modal
    width="50%"
    mobile-width="100%"
    v-model:visible="internalVisible"
    :title="$t(`填写示意图`)"
    :footer="false"
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
