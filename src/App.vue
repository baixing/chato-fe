<template>
  <el-config-provider :locale="clocale">
    <div class="flex flex-col flex-1 h-full">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import useBaiduPromotion from '@/composables/useBaiduPromotion'
import useFavicon from '@/composables/useFavicon'
import { Elementlocales } from '@/locales'
import { useBase } from '@/stores/base'
import { useLocales } from '@/stores/locales'
import { ElConfigProvider } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'

// 设置不同环境的 Favicon
useFavicon()
useBaiduPromotion()
const base = useBase()
const { locale } = storeToRefs(useLocales())
const clocale = computed(() => Elementlocales[locale.value])

const initABTest = async () => {
  try {
    await base.getABTestConfig()
  } catch (e) {}
}

onMounted(() => {
  initABTest()
})
</script>
