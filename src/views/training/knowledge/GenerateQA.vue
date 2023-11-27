<template>
  <div
    class="w-full h-full generate-qa flex flex-col justify-center items-center"
    v-loading="loading"
  >
    <div class="w-full flex justify-between items-center mb-4 md:flex-wrap">
      <el-page-header @back="onGoBack" class="flex-shrink-0 text-xl" :title="$t('返回文档')" />
      <div
        class="w-full flex md:block md:flex-wrap md:mt-2 justify-between items-center text-[#596780] text-sm"
      >
        <div class="flex items-center cursor-pointer">
          <span>
            {{ $t('待审核（{count2}）条', { count2: unAuditedLen }) }}
          </span>

          <el-button class="ml-6" type="primary" link @click="onRefreshList">
            {{ $t('刷新') }}
          </el-button>
        </div>

        <div class="cursor-pointer md:mt-3 md:text-right" v-if="auditedGenerateList.length">
          <span
            class="text-[#F56C6C] mr-5"
            @click="onDeprecatedOrUnloading(0, true, EDocConvertOrDisuse.disuse)"
          >
            {{ $t('全部弃用') }} &times;
          </span>
          <span
            class="text-[#00B240]"
            @click="onDeprecatedOrUnloading(0, true, EDocConvertOrDisuse.convert)"
          >
            {{ $t('全部转存') }} &check;
          </span>
        </div>
      </div>
    </div>
    <div v-if="auditedGenerateList.length" class="w-full p-4 pb-6 bg-[#F7F7F7] rounded-lg">
      <el-form label-position="top" class="w-full" :model="generateForm">
        <el-form-item :label="$t('用户问题')" prop="question">
          <el-input
            type="text"
            v-model="generateForm.question"
            :placeholder="$t('请输入问题')"
            class="w-full"
            @input="
              () =>
                onSaveQuestion(
                  auditedGenerateList[next].id,
                  generateForm.question,
                  generateForm.answer
                )
            "
          />
        </el-form-item>
        <el-form-item :label="$t('回复答案')" prop="answer">
          <el-input
            type="textarea"
            :rows="!isMobile ? 20 : 5"
            v-model="generateForm.answer"
            :placeholder="$t('请输入答案')"
            @input="
              () =>
                onSaveQuestion(
                  auditedGenerateList[next].id,
                  generateForm.question,
                  generateForm.answer
                )
            "
            class="w-full"
          />
        </el-form-item>
        <el-form-item>
          <div
            v-if="sourcesData.length"
            class="flex items-center gap-1 mr-5 h-5 mt-2 text-[#596780] cursor-pointer"
            @click="drawerVisible = true"
          >
            <svg-icon name="folder-open" svg-class="w-5 h-5 text-[#596780]" />
            <span class="text-xs mt-[2px]">
              {{ $t('文档：来源于 {num} 个段落', { num: sourcesData.length }) }}
            </span>
          </div>
        </el-form-item>
        <el-form-item class="w-full mt-10">
          <div class="w-full flex justify-center">
            <el-button class="mr-16 md:mr-2" :disabled="!next" @click="onBack">
              {{ $t('上一个') }}
            </el-button>
            <el-button
              class="mr-5"
              :disabled="!auditedGenerateList.length"
              style="--el-button-text-color: #ea0000; --el-button-border-color: #ea0000"
              @click="
                onDeprecatedOrUnloading(
                  auditedGenerateList[next].id,
                  false,
                  EDocConvertOrDisuse.disuse
                )
              "
            >
              {{ $t('弃用') }}
            </el-button>
            <el-button
              type="primary"
              class="mr-16 md:mr-2"
              :disabled="!auditedGenerateList.length"
              @click="
                onDeprecatedOrUnloading(
                  auditedGenerateList[next].id,
                  false,
                  EDocConvertOrDisuse.convert
                )
              "
            >
              {{ $t('转存') }}
            </el-button>
            <el-button :disabled="next >= auditedGenerateList.length - 1" @click="onNext">
              {{ $t('下一个') }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div v-else class="m-auto mt-32 md:mt-16 flex flex-col items-center">
      <svg-icon name="generate-empty" svgClass="w-[128px] h-[128px]"></svg-icon>
      <p class="mt-6 text-[#9DA3AF] text-sm">{{ $t('暂无审核内容') }}</p>
    </div>
    <GenerateQADrawer v-model:visible="drawerVisible" :sourcesData="sourcesData" />
  </div>
</template>

<script setup lang="ts">
import {
  getGenerateDocListAPI,
  patchGenerateQASaveAPI,
  postGenerateQAUnloadingAPI
} from '@/api/file'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { EDocConvertOrDisuse } from '@/enum/knowledge'
import type { IQuestionConvertQAList, IQuestionConvertQASource } from '@/interface/knowledge'
import { RoutesMap } from '@/router'
import { useDomainStore } from '@/stores/domain'
import { useDebounceFn } from '@vueuse/core'
import { ElMessageBox, ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import GenerateQADrawer from './components/GenerateQADrawer.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { isMobile } = useBasicLayout()
const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)

const docId = computed(() => (route.query.docId as string) || '')
const botId = computed(() => (route.params.botId as string) || '')
const generateForm = reactive({
  page: 1,
  size: 20,
  question: '',
  answer: ''
})
const auditedGenerateList = ref<IQuestionConvertQAList[]>([])
const next = ref(0)
const loading = ref(false)
const drawerVisible = ref(false)
const sourcesData = ref<IQuestionConvertQASource[]>([])

const auditedLen = ref(0) // 已审核
const unAuditedLen = ref(0) // 待审阅

const onGoBack = () => {
  router.push({
    name: RoutesMap.tranning.knowledge,
    params: { botId: botId.value, type: 'doc' }
  })
}

const onNext = () => {
  next.value++
}

const onBack = () => {
  next.value--
}

const onCheckAuditedGenerateList = (id: number, isAll: boolean) => {
  if (isAll) return (auditedGenerateList.value = [])

  const index = auditedGenerateList.value.findIndex((item) => item.id === id)

  if (index !== -1) {
    auditedGenerateList.value.splice(index, 1)
  }

  next.value = 0

  onUpdateGenerateForm()
}

const onSaveQuestion = useDebounceFn(async (id: number, question: string, answer: string) => {
  await patchGenerateQASaveAPI(id, {
    question: question,
    answer: answer
  })
  auditedGenerateList.value = [...auditedGenerateList.value].map((item) => {
    if (item.id === id) {
      item.question = question
      item.answer = answer
    }
    return item
  })
}, 500)

const onDeprecatedOrUnloading = async (id: number, all: boolean, status: EDocConvertOrDisuse) => {
  try {
    if (all) {
      await ElMessageBox.confirm(
        t(
          status === EDocConvertOrDisuse.disuse
            ? '请确认是否全部弃用，弃后不可恢复？'
            : '请确认是否全部转存？'
        ),
        t('温馨提示'),
        {
          confirmButtonText: t('确定'),
          cancelButtonText: t('取消'),
          type: 'warning'
        }
      )
    }
    const data = {
      qa_id: id,
      is_all: all,
      status: status,
      domain_slug: domainInfo.value.slug
    }
    loading.value = true
    await onSaveQuestion(id, generateForm.question, generateForm.answer)
    const res = await postGenerateQAUnloadingAPI(docId.value, data)
    ElNotification.success(res.data.message)
    onCheckAuditedGenerateList(id, all)
    if (all) {
      unAuditedLen.value = 0
      auditedLen.value = 0
    } else {
      unAuditedLen.value--
      auditedLen.value++
    }
  } catch (error) {
  } finally {
    loading.value = false
  }
}

const onInitCurrentGenerateForm = () => {
  // 未审阅的问答
  auditedGenerateList.value.length && onUpdateGenerateForm()
}

const onUpdateGenerateForm = () => {
  const currentGenerate = auditedGenerateList.value[next.value]
  generateForm.question = currentGenerate.question
  generateForm.answer = currentGenerate.answer
  sourcesData.value = currentGenerate.ref_source
}

const onRefreshList = () => {
  generateForm.page = 1
  auditedGenerateList.value = []
  onInitGenerateList()
}

// 获取未审核的
const onInitGenerateList = async () => {
  const res = await getGenerateDocListAPI(docId.value, {
    page: generateForm.page,
    size: generateForm.size,
    is_handle: false
  })
  const { data, pagination } = res.data
  unAuditedLen.value = pagination.total
  auditedGenerateList.value.push(...data)
  if (generateForm.page < pagination.page_count) {
    generateForm.page++
    onInitGenerateList()
  } else {
    onInitCurrentGenerateForm()
  }
}

// 获取已审核的
const onInitCheckedAudited = async () => {
  const res = await getGenerateDocListAPI(docId.value, {
    page: generateForm.page,
    size: generateForm.size,
    is_handle: true
  })

  const { pagination } = res.data
  auditedLen.value = pagination.total
}

watch(next, (n) => {
  if (n >= auditedGenerateList.value.length - 1) return
  onUpdateGenerateForm()
})

onInitGenerateList()
onInitCheckedAudited()
</script>

<style scoped lang="scss">
.generate-qa {
  :deep(.el-page-header__header) {
    .el-page-header__left {
      @apply mr-6;
    }
    .el-page-header__title {
      @apply text-base;
    }
    .el-page-header__content {
      @apply block;
    }
    .el-divider {
      display: none;
    }
  }
}
</style>
