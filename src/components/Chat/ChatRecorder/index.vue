<template>
  <el-tooltip :disabled="isMobile" :content="$t('语音输入')" placement="top" :hide-after="0">
    <div
      text
      :class="['recorder-btn transition-colors', isStart && 'start-trans']"
      :disabled="internalDisabled"
      @click="onRecord"
    >
      <svg-icon svg-class="w-6 h-6 text-[#9DA3AF]" name="chat-sound" />
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
import { useBasicLayout } from '@/composables/useBasicLayout'
import { currentEnvConfig } from '@/config'
import { ElNotification } from 'element-plus'
import { computed, ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import ChartRecognizer from './chatRecognizer'

const { t } = useI18n()
const props = defineProps<{
  str: string
  disabled?: boolean
}>()

const internalDisabled = toRef(props, 'disabled')
const internalStr = computed(() => props.str)

const emit = defineEmits(['update:str', 'recording'])

const DefaultCloseTime = 120 // 最大录制时长秒
const asrStr = ref('')
const ws = ref<WebSocket>()
const srInstantiation = ref<ChartRecognizer>(null)
const isStart = ref(false)
const backFill = ref(true)

const { isMobile } = useBasicLayout()

let nbest: number
let timer

const initSocket = () => {
  const sokcet = new WebSocket(currentEnvConfig.asrSocketURL)

  sokcet.onopen = function () {
    console.log('Websocket 连接成功，开始识别')
    sokcet.send(
      JSON.stringify({
        signal: 'start',
        nbest: 1,
        continuous_decoding: true
      })
    )
  }
  sokcet.onmessage = function (res) {
    parseResult(res.data)
  }
  sokcet.onclose = function () {
    console.log('WebSocket 连接断开')
    if (asrStr.value.length > 0) {
      if (asrStr.value.endsWith('，')) {
        asrStr.value = asrStr.value.slice(0, -1)
      }
      if (backFill.value) {
        emit('update:str', asrStr.value + '。')
      } else {
        emit('update:str', '')
      }
      asrStr.value = ''
    }
  }

  ws.value = sokcet
}

const parseResult = (res) => {
  const data = JSON.parse(res)
  if (data.type == 'partial_result') {
    nbest = JSON.parse(data.nbest)
    const sentence = nbest[0].sentence
    if (sentence.length > 0) {
      // 每次识别的 sentence
      emit('update:str', asrStr.value + sentence)
    }
  } else if (data.type == 'final_result') {
    nbest = JSON.parse(data.nbest)
    const sentence = nbest[0].sentence
    if (sentence.length > 0) {
      asrStr.value += sentence + '，'
      emit('update:str', asrStr.value)
    }
  }
}

const transferUpload = (number, blobOrNull, duration, blobRec, isClose) => {
  if (blobOrNull) {
    const blob = blobOrNull
    const reader = new FileReader()

    reader.onloadend = function () {
      ws.value?.send(reader.result)
    }

    reader.readAsArrayBuffer(blob)
  }
}

const startRecording = () => {
  try {
    timer && clearTimeout(timer)
    isStart.value = true
    backFill.value = true
    asrStr.value = internalStr.value
    emit('recording', 'start')

    initSocket()
    srInstantiation.value = new ChartRecognizer({
      soundType: 'pcm',
      sampleRate: 16000,
      recwaveElm: '.recwave',
      translerCallBack: transferUpload
    })

    setTimeout(() => {
      const refusedMsg = srInstantiation.value.recorderRefusedAuthorized
      if (refusedMsg) {
        isStart.value = false
        ElNotification.error(refusedMsg)
      }
    }, 100)

    timer = setTimeout(() => {
      stopRecording()
    }, DefaultCloseTime * 1000)
  } catch (err) {
    ElNotification.error(t('录音识别失败'))
  }
}

const stopRecording = (latestSend = true) => {
  ws.value?.send(JSON.stringify({ signal: 'end' }))
  srInstantiation.value && srInstantiation.value.recordClose(latestSend)
  !latestSend && (backFill.value = false)
  timer && clearTimeout(timer)
  isStart.value = false
  emit('recording', 'end')
}

const onRecord = () => {
  if (internalDisabled.value) {
    return
  }

  if (!isStart.value) {
    startRecording()
  } else {
    stopRecording()
  }
}

defineExpose({
  isRecording: isStart,
  stopRecording
})
</script>

<style scoped lang="scss">
.recorder-btn {
  position: relative;
  border-radius: 4px;
  height: 32px;
  white-space: nowrap;
  padding: 4px;
  margin: 0 4px 0 0;
  background-color: white;
  cursor: pointer;
  display: inline-block;
  transition: all 0.3s ease-in-out;
  border-radius: 100%;
  box-sizing: border-box;

  &:hover {
    background-color: #f2f3f5;
    svg {
      color: #7c5cfc;
    }
  }
}

.start-trans {
  svg {
    color: #7c5cfc;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    border: 1px solid #7c5cfc;
    border-radius: 50%;
    box-sizing: border-box;
    pointer-events: none;
    animation: wateranimate 2s infinite;
  }
}

@-webkit-keyframes wateranimate {
  0% {
    -webkit-transform: scale(0);
    opacity: 1;
  }

  20% {
    opacity: 1;
  }

  70% {
    -webkit-transform: scale(1.25);
    opacity: 0;
  }

  to {
    opacity: 0;
  }
}

@keyframes wateranimate {
  0% {
    transform: scale(0);
    opacity: 1;
  }

  20% {
    opacity: 1;
  }

  70% {
    transform: scale(1.25);
    opacity: 0;
  }

  to {
    opacity: 0;
  }
}
</style>
