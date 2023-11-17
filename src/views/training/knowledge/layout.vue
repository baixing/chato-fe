<template>
  <ContentLayout :key="route.name" class="bg-white pt-8">
    <router-view />
  </ContentLayout>
</template>

<script setup lang="ts">
import ContentLayout from '@/layout/ContentLayout.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped></style>
