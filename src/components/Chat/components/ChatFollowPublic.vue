<template>
  <Modal
    width="16%"
    mobile-width="95%"
    v-model:visible="visible"
    :title="$t('关注阿旺机器人公众号')"
    :footer="false"
    @cancel="() => emit('update:value', false)"
  >
    <img class="w-full" :src="followImage" alt="阿旺机器人公众号" />
  </Modal>
</template>

<script setup lang="ts">
import followImage from '@/assets/img/public/awang-public.png'
import { computed } from 'vue'
import Modal from '../../Modal/index.vue'

const props = defineProps<{
  value: boolean
}>()

const emit = defineEmits(['update:value'])
const visible = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
</script>

<style scoped></style>
