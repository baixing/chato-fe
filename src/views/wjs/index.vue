<template>
  <div
    class="w-screen h-screen wjs-container pt-[2vw] pb-[2vw] pr-[3vw] box-border flex justify-end items-end"
  >
    <div>
      <div class="mb-10 flex items-center justify-end gap-10 pr-12">
        <img src="@/assets/img/wxh/baixing.png" class="w-[9vw] h-[2vw] object-cover" />
        <img src="@/assets/img/wxh/chato.png" class="w-[9vw] h-[2vw] object-cover" />
      </div>
      <div class="w-[59vw] h-[45vw] rounded-[66px] p-11 bg-[#1F1939] box-border overflow-hidden">
        <div class="rounded-[44px] overflow-hidden h-full box-border">
          <Chat
            :isChatingPractice="true"
            :isreadRouteParam="true"
            chat-by-audio
            chatClassName="chat-wjs"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Chat from '@/components/Chat/index.vue'
</script>

<style lang="scss">
.wjs-container {
  background-image: url('@/assets/img/wjs/bg.png');
  background-size: cover;

  .chat-wjs {
    max-width: none;
    width: 100%;
    height: 100%;
    padding: 0 24px;
    box-sizing: border-box;
  }
}
</style>
