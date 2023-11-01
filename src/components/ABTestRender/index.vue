<template>
  <slot v-if="currentABTestSlot" :name="currentABTestView"></slot>
</template>

<script setup lang="ts">
import useABTest from '@/composables/useABTest'
import { computed, useSlots } from 'vue'

const props = defineProps<{ caseNum: number }>()

const { currentABTestView } = useABTest(props.caseNum)
const currentABTestSlot = computed(() => !!useSlots()[currentABTestView.value])
</script>
