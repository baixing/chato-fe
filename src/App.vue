<template>
  <el-config-provider :locale="clocale">
    <div class="flex flex-col flex-1 h-full">
      <el-alert
        v-if="isChrome"
        :title="$t(`为保证使用体验，建议使用 Chrome 浏览器访问`)"
        type="warning"
        center
        @close="clickFrequency = true"
      />
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import usePlatform from '@/composables/usePlatform'
import { Elementlocales } from '@/locales'
import { useLocales } from '@/stores/locales'
import { useStorage } from '@vueuse/core'
import { ElConfigProvider } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const { locale } = storeToRefs(useLocales())
const clickFrequency = useStorage('clickFrequency', false)
const platformInfo = usePlatform()
const isChrome = computed(
  () => !platformInfo.chrome && !platformInfo.mobile && !clickFrequency.value
)
const clocale = computed(() => Elementlocales[locale.value])
</script>
