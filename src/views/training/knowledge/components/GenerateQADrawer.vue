<template>
  <el-drawer
    v-model="visible"
    :title="$t(`来源片段`)"
    :size="isMobile ? '80%' : '40%'"
    class="doc-source-drawer"
  >
    <el-collapse v-model="expandCollapseName">
      <el-collapse-item v-for="(item, index) in sourcesData" :key="item.id" :name="item.id">
        <template #title>
          <p class="leading-5 line-clamp-2 break-all">
            <span>{{ $t('片段') }} {{ index + 1 }}；</span>
            <span>{{ $t('相关性') }}：{{ Math.round(item.score * 100) }}%</span>
          </p>
        </template>
        <p>{{ item.content }}</p>
      </el-collapse-item>
    </el-collapse>
  </el-drawer>
</template>

<script setup lang="ts">
import { useBasicLayout } from '@/composables/useBasicLayout'
import type { IQuestionConvertQASource } from '@/interface/knowledge'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    visible: boolean
    sourcesData: IQuestionConvertQASource[]
  }>(),
  {
    visible: false
  }
)

const emit = defineEmits(['update:visible'])

const { isMobile } = useBasicLayout()
const visible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const expandCollapseName = ref(props.sourcesData.length ? props.sourcesData[0].id : '')
</script>

<style lang="scss">
.doc-source-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    color: #303133;
    font-weight: 500;
  }

  .el-drawer__body {
    padding: var(--el-drawer-padding-primary) !important;
  }

  .el-collapse-item__header {
    line-height: calc(1em + 2px);
  }
}
</style>
