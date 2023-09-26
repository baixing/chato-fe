<template>
  <div class="w-screen h-screen wjs-container relative">
    <div class="absolute top-[60px] left-[110px] flex items-center justify-end gap-10">
      <img src="@/assets/img/wxh/baixing.png" class="w-[200px] object-cover" />
      <img src="@/assets/img/wxh/chato.png" class="w-[200px] object-cover" />
    </div>
    <div
      class="w-[59%] h-[80%] rounded-[128px] box-border overflow-hidden absolute top-[160px] left-[60px] p-10 bg-[#1f1939]"
    >
      <div class="rounded-[108px] overflow-hidden h-full box-border">
        <Chat
          :isChatingPractice="true"
          :isreadRouteParam="true"
          chat-by-audio
          chatClassName="chat-wjs"
        />
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
  background-position: top right;

  .chat-wjs {
    max-width: none;
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    .chat-center {
      padding: 0 24px !important;
    }

    .recorder-container {
      left: 24px !important;
      right: 24px !important;
    }
  }
}
</style>
