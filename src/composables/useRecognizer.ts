import { currentEnvConfig } from '@/config'
import Recognizer from '@/utils/recognizer'
import { ElNotification } from 'element-plus'
import { onBeforeUnmount, ref, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'

export default function useRecognizer({
  updateStr,
  checkNeedReopen
}: {
  updateStr: (v: string) => void
  checkNeedReopen?: () => boolean
}) {
  // const DefaultCloseTime = 120 // 最大录制时长秒
  const asrStr = ref('')
  const ws = ref<WebSocket>()
  const srInstantiation = ref<Recognizer>(null)
  const isStart = ref(false)
  const backFill = ref(true)

  const { t } = useI18n()
  let nbest: number
  let reopenTimer

  const initRecognizer = () => {
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
          updateStr(asrStr.value + '。')
        } else {
          updateStr('')
        }
        asrStr.value = ''
      }
      if (checkNeedReopen?.() && !reopenTimer) {
        reopenTimer = setTimeout(() => startRecording(''), 100)
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
        updateStr(asrStr.value + sentence)
      }
    } else if (data.type == 'final_result') {
      nbest = JSON.parse(data.nbest)
      const sentence = nbest[0].sentence
      if (sentence.length > 0) {
        asrStr.value += sentence + '，'
        updateStr(asrStr.value)
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

  const startRecording = (str: string = '') => {
    try {
      isStart.value = true
      backFill.value = true
      asrStr.value = str

      initRecognizer()
      srInstantiation.value = new Recognizer({
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
    } catch (err) {
      stopRecording()
      ElNotification.error(t('录音识别失败'))
    }
  }

  const stopRecording = (latestSend = true) => {
    if (ws.value?.readyState === 1) {
      ws.value?.send(JSON.stringify({ signal: 'end' }))
    }
    srInstantiation.value && srInstantiation.value.recordClose(latestSend)
    !latestSend && (backFill.value = latestSend)
    reopenTimer && clearTimeout(reopenTimer)
    isStart.value = false
    const lastAsrStr = toRaw(asrStr.value)
    if (lastAsrStr.endsWith('，')) {
      updateStr(lastAsrStr.slice(0, -1) + '。')
    }
    resetAsr()
  }

  const resetAsr = () => {
    asrStr.value = ''
  }

  onBeforeUnmount(() => {
    ws.value = null
    stopRecording()
  })

  return {
    isRecording: isStart,
    startRecording,
    stopRecording,
    resetAsr
  }
}
