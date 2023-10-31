<template>
  <Modal
    width="35%"
    mobile-width="100%"
    v-model:visible="internalVisible"
    :title="$t(`分享海报`)"
    :footer="false"
  >
    <div class="flex justify-center items-center">
      <el-image :src="base64Image" bordered="false" errorLevel="M" style="width: 300px" />
      <a @click="downloadImage" class="description text-sm text-[#7C5CFC] ml-4">
        {{ $t('保存') }}
      </a>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import { computed, ref } from 'vue'
import { createPosterAPI } from '@/api/release'

const props = defineProps<{
  value: boolean
  domainId: number
}>()

const emit = defineEmits(['update:value', 'handleCopyLink'])

const internalVisible = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})

const base64Image = ref('')

const init = async () => {
  const data = await createPosterAPI({
    domain_id: props.domainId
  })
  base64Image.value = 'data:image/png;base64,' + data.data.data
}

const downloadImage = () => {
  // Convert base64 to blob
  const byteString = atob(base64Image.value.split(',')[1])
  const arrayBuffer = new ArrayBuffer(byteString.length)
  const int8Array = new Uint8Array(arrayBuffer)
  for (let i = 0; i < byteString.length; i++) {
    int8Array[i] = byteString.charCodeAt(i)
  }
  const blob = new Blob([int8Array], { type: 'image/png' })

  // Create URL for blob and trigger download
  const objectURL = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectURL
  link.download = 'Chato.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

init()
</script>
