<template>
  <div class="h-screen w-screen bg-black pt-[260px] wxh-container relative">
    <img
      src="@/assets/img/wxh/xh.png"
      class="absolute w-[760px] object-cover left-0 top-10 z-[2]"
    />
    <div class="flex justify-end pr-[120px]">
      <div class="inline-flex text-right mb-10 flex-col items-center justify-end">
        <p class="inline-block text-white font-bold text-7xl mb-14">王小慧</p>
        <p class="inline-block text-[#CEADFC] font-medium text-4xl mb-12">扫码体验</p>
        <img
          src="@/assets/img/wxh/crcode.png"
          class="w-48 h-48 object-cover rounded-xl overflow-hidden"
        />
      </div>
    </div>
    <div
      class="box-border w-[912px] h-[937px] p-6 mx-auto overflow-hidden rounded-[64px] mb-9 linear-bg-block"
    >
      <div class="overflow-hidden h-full rounded-[64px] relative z-[3]">
        <Chat
          ref="chatRef"
          :isChatingPractice="true"
          :isreadRouteParam="true"
          chat-by-audio
          chatClassName="chat-wxh"
        />
      </div>
    </div>
    <div class="rounded-[64px] box-border w-[914px] h-[163px] p-2 mx-auto linear-bg-block-1">
      <div class="rounded-[64px] box-border bg-black h-full p-5">
        <div class="rounded-[64px] box-border h-full linear-bg-block-2 p-1">
          <div
            class="rounded-[64px] box-border bg-black h-full py-6 flex items-center justify-center gap-14"
          >
            <img src="@/assets/img/wxh/chato.png" class="w-[229px] h-[57px] object-cover" />
            <img src="@/assets/img/wxh/baixing.png" class="w-[201px] h-[48px] object-cover" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Chat from '@/components/Chat/index.vue'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const chatRef = ref()
const route = useRoute()

watch(chatRef, (v) => {
  if (!v) {
    return
  }

  v.onClearHistoryRelation(route.params.botSlug)
})
</script>

<style lang="scss">
.wxh-container {
  background-image: url('@/assets/img/wxh/bg.jpeg');
  background-size: cover;
  background-position: center;

  div {
    box-sizing: border-box;
  }

  .chat-wxh {
    max-width: none;
    padding: 0 24px;
    width: 100%;
    box-sizing: border-box;
    font-size: 100px;
  }

  .linear-bg-block {
    background: linear-gradient(136deg, #2b49aa 0%, #c66ae6 100%);
  }

  .linear-bg-block-1 {
    background: linear-gradient(90deg, #014bae 0%, #ca6ce3 100%);
  }

  .linear-bg-block-2 {
    background: linear-gradient(90deg, #024caf 0%, #cc6be6 99%);
  }
}
</style>
