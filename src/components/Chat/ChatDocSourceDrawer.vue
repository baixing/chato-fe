<template>
  <el-drawer
    v-model="internalVisible"
    :title="$t(`文档来源`)"
    :size="isMobile ? '80%' : '40%'"
    class="source-drawer"
  >
    <el-skeleton :rows="5" :animated="true" :loading="loading">
      <el-collapse v-model="expandCollapseName">
        <el-collapse-item v-for="(item, index) in sourcesData" :key="item.id" :name="item.id">
          <template #title>
            <p class="leading-5 line-clamp-2 break-all">
              <span>文档 {{ index + 1 }}:</span>
              <template v-if="slotAfterTitle">
                <slot name="afterTitle" :item="item"></slot>
              </template>
              <template v-else>
                <a
                  :class="['mr-2 text-[#303133]', item.url && 'hover:text-[#7c5cfc]']"
                  href="javascript:;"
                  @click.stop="previewFile(item)"
                >
                  {{ item.title }}
                </a>
                <span>相关性：{{ Math.round(item.score * 100) }}%</span>
              </template>
            </p>
          </template>
          <p>{{ item.content }}</p>
        </el-collapse-item>
      </el-collapse>
    </el-skeleton>
  </el-drawer>
</template>

<script setup lang="ts">
import { getCitationSource } from '@/api/chat'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { EChatCitationSourceFileType } from '@/enum/chat'
import { ETerminal } from '@/enum/common'
import type { IChatCitationSource } from '@/interface/chat'
import { openPreviewUrl } from '@/utils/help'
import { computed, ref, useSlots, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    visible: boolean
    questionId?: number
    slug?: string
    terminal?: ETerminal
  }>(),
  {
    visible: false,
    terminal: ETerminal.B
  }
)

const emit = defineEmits(['update:visible'])

const slotAfterTitle = !!useSlots().afterTitle
const { isMobile } = useBasicLayout()

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const internalState = computed(() => {
  return {
    questionId: props.questionId,
    slug: props.slug
  }
})

const loading = ref(false)
const sourcesData = ref<IChatCitationSource[]>([])
const expandCollapseName = computed(() =>
  sourcesData.value[0]?.id ? [sourcesData.value[0].id] : []
)

const previewFile = (item: IChatCitationSource) => {
  if (item.file_type === EChatCitationSourceFileType.text) {
    return
  }

  openPreviewUrl(item.url)
}

const init = async () => {
  loading.value = true

  try {
    const params = {
      question_id: internalState.value.questionId,
      slug: internalState.value.slug,
      terminal: props.terminal
    }

    const {
      data: { data }
    } = await getCitationSource(params)

    sourcesData.value = data.sort((a, b) => {
      return b.score - a.score
    })
  } catch (e) {
  } finally {
    loading.value = false
  }
}

watch(internalVisible, (v) => {
  if (!v) {
    return
  }

  init()
})
</script>

<style lang="scss">
.source-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    color: #303133;
    font-weight: 500;
  }

  .el-collapse-item__header {
    line-height: calc(1em + 2px);
  }
}
</style>
