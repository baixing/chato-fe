<template>
  <div
    class="w-full max-h-[690px] overflow-hidden box-border border border-solid border-[#eee] relative flex flex-col"
  >
    <div
      v-show="internalTitleVisible"
      class="flex items-center gap-2 h-12 justify-center font-medium text-sm mx-4 shrink-0 overflow-hidden"
      style="border-bottom: 1px solid #eee"
    >
      <img
        :src="internalBot?.avatar || DefaultAvatar"
        class="w-7 h-7 rounded-full object-cover"
        alt=""
      />
      <span>{{ renderWithDefaultContent(internalBot?.name) }}</span>
    </div>
    <div class="p-4 h-full overflow-y-auto min-h-[460px]">
      <div v-show="internalDescVisible" class="flex gap-3 p-4 rounded-lg bg-[#f2f3f5] mb-5">
        <img
          :src="internalBot?.avatar || DefaultAvatar"
          alt=""
          class="w-14 h-14 rounded-full shrink-0 object-cover"
        />
        <div class="text-[#596780] text-[13px] leading-[22px] overflow-hidden">
          <div class="mb-2 text-base font-medium text-[#3d3d3d]">
            {{ renderWithDefaultContent(internalBot?.name) }}
          </div>
          <p class="break-all">{{ internalBot?.desc }}</p>
        </div>
      </div>

      <div class="message">
        <p v-if="internalBot?.welcome" v-html="regReplaceA(internalBot.welcome)"></p>
        <span v-else>...</span>
      </div>

      <div class="message float-right" :style="`background-color: ${internalBot?.message_style};`">
        {{ $t('你好，请做个自我介绍？') }}
      </div>
    </div>
    <div class="flex flex-wrap gap-2 px-4">
      <div
        class="px-[14px] py-[6px] text-xs text-[#3D3D3D] leading-4 bg-[#F2F3F5] rounded-3xl break-all"
        v-for="(item, index) in internalShortcuts"
        :key="`shortcut-${index}`"
      >
        {{ item.title }}
      </div>
    </div>

    <div class="m-4 border border-solid border-[#eee] h-12 flex items-center px-3 py-2">
      <p class="text-sm text-[#DCDFE6] flex-1">{{ $t('输入您的问题') }}</p>
      <div class="w-[1px] bg-[#eee] h-full mr-2"></div>
      <svg-icon svg-class="w-6 h-6 text-[#9DA3AF] mr-1" name="chat-sound" />
      <svg-icon svg-class="w-6 h-6 text-[#9DA3AF]" name="chat-send" />
    </div>

    <ChatFooter
      v-show="internalBrandVisible"
      :name="internalBot.brand_name"
      :logo="internalBot.brand_logo"
      class="mb-4"
    />
  </div>
</template>
<script lang="ts" setup>
import DefaultAvatar from '@/assets/img/avatar.png'
import ChatFooter from '@/components/Chat/ChatFooter.vue'
import type { IDomainInfo, IDomainShortcut } from '@/interface/domain'
import { regReplaceA } from '@/utils/reg'
import { computed } from 'vue'

const props = defineProps<{
  bot: IDomainInfo
  shortcuts: IDomainShortcut[]
  brandVisible?: boolean
  titleVisible?: boolean
  descVisible?: boolean
}>()

const internalTitleVisible = computed(() => props.titleVisible)
const internalDescVisible = computed(() => props.descVisible)
const internalBrandVisible = computed(() => props.brandVisible)
const internalShortcuts = computed(() => props.shortcuts)
const internalBot = computed<Partial<IDomainInfo>>(() => props.bot || {})

const renderWithDefaultContent = (val: string) => val || '...'
</script>
<style lang="scss" scoped>
.message {
  width: fit-content;
  padding: 12px 1em 12px;
  min-height: 32px;
  line-height: 1.5;
  color: #2f3447;
  white-space: pre-wrap;
  word-break: break-all;
  background-color: #f2f3f5;
  border-radius: 8px;
  text-align: left;
  margin-bottom: 20px;
}
</style>
