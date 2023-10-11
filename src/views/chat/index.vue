<template>
  <div class="relative h-full overflow-hidden">
    <Topbar class="absolute top-0 left-0 inline-block h-[52px] z-[2]" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import Topbar from '@/components/Topbar/index.vue'
</script>
