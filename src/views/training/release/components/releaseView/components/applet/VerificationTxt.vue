<template>
  <Modal mobile-width="90%" v-model:visible="visible" :title="$t(`域名校验`)" :footer="false">
    <div class="flex flex-col justify-start items-start">
      <span class="text-[#3D3D3D] font-medium mr-3 mb-3">{{ $t('校验文件') }}:</span>
      <UploadFile
        v-model:value="uploadDomain"
        :disabled="false"
        :name="$t(`上传文件`)"
        :extra="$t(`后缀为：*.txt的文件，上传成功后约一分钟生效，请耐心等待`)"
        class="w-full"
        :maxSize="0.5"
        :limitType="['.txt']"
      />
    </div>
    <p class="text-[#9DA3AF] my-4 md:text-xs">
      {{ $t('如何获取校验文件？') }}
      <a :href="domainDocumentsUrl" class="theme-color">
        ({{ $t('微信小程序域名校验文件获取指引') }})
      </a>
    </p>
    <div class="flex flex-col justify-start items-start text-sm leading-6 md:text-xs">
      <span class="text-[#3D3D3D] font-medium mr-3">{{ $t('域名地址') }}:</span>
      <div class="flex items-center">
        {{ chatAPI }}
        <el-button link type="primary" class="ml-3" @click="$copyText(chatAPI)">
          {{ $t('复制') }}
        </el-button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { cosServe } from '@/utils/cos'
import type { UploadFiles, UploadUserFile } from 'element-plus'
import { computed, ref, watch } from 'vue'
import UploadFile from '../UploadFile.vue'

const emit = defineEmits(['update:value', 'showDrawerSite'])
const props = defineProps<{
  value: boolean
  chatAPI: string
}>()

const uploadDomain = ref<UploadUserFile[]>([])
const visible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})

const domainDocumentsUrl = 'https://baixingwang.feishu.cn/docx/HCyHdcon9o3627xcKhBcN5VinVf'

watch(uploadDomain, async (value: UploadFiles, oldValue: UploadFiles) => {
  if (value.length > oldValue.length) {
    await cosServe(value.at(-1).raw, 'domain/check', false, value.at(-1).name)
  }
})
</script>
