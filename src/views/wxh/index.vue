<template>
  <div class="h-screen w-screen bg-black pt-[33vw] wxh-container relative">
    <img
      src="@/assets/img/wxh/xh.png"
      class="absolute w-[68vw] object-cover left-0 top-[11.5vw] z-[2]"
    />
    <div class="px-[16vw] text-right mb-20 flex flex-col items-end">
      <p class="text-white font-bold text-9xl mb-40">王小慧</p>
      <p class="text-[#CEADFC] font-medium text-8xl mb-24">扫码体验</p>
      <img
        src="@/assets/img/wxh/crcode.png"
        class="w-96 h-96 object-cover rounded-2xl overflow-hidden"
      />
    </div>
    <div
      class="box-border w-[84vw] h-[86vw] px-20 py-14 mx-auto overflow-hidden rounded-[4vw] mb-[1vw] linear-bg-block"
    >
      <div class="overflow-hidden h-full rounded-[4vw] relative z-[3]">
        <Chat
          :isChatingPractice="true"
          :isreadRouteParam="true"
          chat-by-audio
          chatClassName="chat-wxh"
        />
      </div>
    </div>
    <div class="rounded-[4vw] box-border w-[84vw] h-[12vw] p-5 mx-auto linear-bg-block-1">
      <div class="rounded-[4vw] box-border bg-black h-full p-5">
        <div class="rounded-[4vw] box-border h-full linear-bg-block-2 p-2">
          <div
            class="rounded-[4vw] box-border bg-black h-full py-6 flex items-center justify-center gap-40"
          >
            <img src="@/assets/img/wxh/chato.png" class="w-[21vw] h-[5vw] object-cover" />
            <img src="@/assets/img/wxh/baixing.png" class="w-[18vw] h-[4vw] object-cover" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Chat from '@/components/Chat/index.vue'
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
    padding: 2vw 4vw;
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
