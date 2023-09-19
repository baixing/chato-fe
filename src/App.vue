<template>
  <el-config-provider :locale="clocale">
    <div class="flex flex-col flex-1 h-full">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { Elementlocales } from '@/locales'
import { useLocales } from '@/stores/locales'
import { ElConfigProvider } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const { locale } = storeToRefs(useLocales())
const clocale = computed(() => Elementlocales[locale.value])
</script>
