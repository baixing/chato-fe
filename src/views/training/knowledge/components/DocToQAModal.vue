<template>
  <Modal v-model:visible="internalVisible" title="生成训练问答" :footer="false">
    <el-form label-position="top" :model="formState" class="chato-form">
      <el-form-item label="Prompt">
        <el-input
          v-model="formState.prompt"
          type="textarea"
          :rows="4"
          :placeholder="$t('请输入 Prompt')"
        />
      </el-form-item>
      <el-form-item :label="$t('短文档')">
        <div class="flex gap-3 items-center">
          <el-input-number
            :min="1"
            v-model="formState.short_doc_count"
            :placeholder="$t('短文档个数')"
          />
          {{ $t('个') }}
          <el-input-number
            :min="1"
            v-model="formState.short_doc_txt"
            :placeholder="$t('短文档字数')"
          />
          {{ $t('字') }}
        </div>
      </el-form-item>
      <el-form-item :label="$t('长文档')">
        <div class="flex gap-3 items-center">
          <el-input-number
            :min="1"
            v-model="formState.long_doc_count"
            :placeholder="$t('长文档个数')"
          />
          {{ $t('个') }}
          <el-input-number
            :min="1"
            v-model="formState.long_doc_txt"
            :placeholder="$t('长文档字数')"
          />
          {{ $t('字') }}
        </div>
      </el-form-item>
    </el-form>
    <div class="flex justify-end">
      <el-button :loading="generating" type="primary" @click="onGenerate">
        {{ $t('生成并发送至飞书') }}
      </el-button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { docToQA } from '@/api/file'
import type { IDocmentToQAParams } from '@/interface/knowledge'
import { ElNotification } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const props = defineProps<{
  visible: boolean
  ids: (string | number)[]
}>()

const emit = defineEmits(['update:visible'])

const route = useRoute()
const { t } = useI18n()

const domainId = route.params.botId as string

const defaultFormState: IDocmentToQAParams = {
  file_ids: [],
  short_doc_count: 3,
  short_doc_txt: 1000,
  long_doc_count: 3,
  long_doc_txt: 5000,
  prompt: ''
}

const internalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})
const internalIDs = computed(() => props.ids)
let formState = reactive<IDocmentToQAParams>({ ...defaultFormState })
const generating = ref(false)

const onGenerate = async () => {
  try {
    generating.value = true
    await docToQA(domainId, { ...formState, file_ids: internalIDs.value })
    ElNotification.success(t('生成成功'))
    internalVisible.value = false
  } catch (e) {
  } finally {
    generating.value = false
  }
}

watch(internalVisible, (v) => {
  if (v) {
    formState = Object.assign(formState, { ...defaultFormState })
  }
})
</script>
