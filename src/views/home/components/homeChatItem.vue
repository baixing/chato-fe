<template>
  <ChatItem :authLogin="true" :isInternal="isLoggedIn" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import ChatItem from '@/views/chating/ChatItem.vue'

const authStoreI = useAuthStore()
const { authToken } = storeToRefs(authStoreI)

const isLoggedIn = computed(() => !!authToken.value)
</script>
