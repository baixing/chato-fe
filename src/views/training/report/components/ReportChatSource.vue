<template>
  <div
    class="absolute top-0 left-0 z-[999] bg-[#f2f3f5bd] w-full text-[#303133] overflow-hidden text-xs leading-5 py-3 px-5"
    style="border: 1px solid 303133"
  >
    <p class="float-left w-1/2 truncate overflow-hidden whitespace-nowrap">
      咨询页：{{ currentChatUser.title }}
    </p>
    <p class="float-left w-1/2 truncate overflow-hidden whitespace-nowrap">
      渠道：{{ currentChatUser.source }}
    </p>
    <p class="float-left w-1/2 truncate overflow-hidden whitespace-nowrap">
      着陆页：{{ currentChatUser.url }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { getCommonGraph } from '@/api/graph'
import type { ChatToBotRes } from '@/interface/chat'
import { useDomainStore } from '@/stores/domain'
import { extractData } from '@/utils/reg'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

const domainStoreI = useDomainStore()
const { domainInfo } = storeToRefs(domainStoreI)

const props = defineProps<{
  uid: string
}>()

const currentChatUser = ref<{ title: string; source: string; url: string }>({
  title: '无',
  source: '无',
  url: ''
})

const init = async () => {
  const {
    data: { data }
  } = await getCommonGraph<ChatToBotRes[]>('chato_questions', {
    filter: `sender_uid=="${props.uid}" and domain_id=="${domainInfo.value.id}"`,
    page: 1,
    size: 1,
    sort: '-id'
  })

  if (data.length) {
    currentChatUser.value = {
      title: extractData(data[0].source_id).title,
      source: data[0].source,
      url: extractData(data[0].source_id).url
    }
  }
}

watch(
  () => props.uid,
  () => {
    init()
  },
  {
    immediate: true
  }
)
</script>

<style scoped></style>
