import { postASRRecongnitionAPI } from '@/api/audio'
import Recognizer from '@/utils/recognizer'
import { ElNotification } from 'element-plus'
import { onBeforeUnmount, ref } from 'vue'
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
  const isLoading = ref(false)

  const { t } = useI18n()
  let nbest: number
  let reopenTimer

  // const initRecognizer = () => {
  // const sokcet = new WebSocket(currentEnvConfig.asrSocketURL)

  // sokcet.onopen = function () {
  //   console.log('Websocket 连接成功，开始识别')
  //   sokcet.send(
  //     JSON.stringify({
  //       signal: 'start',
  //       nbest: 1,
  //       continuous_decoding: true
  //     })
  //   )
  // }
  // sokcet.onmessage = function (res) {
  //   parseResult(res.data)
  // }
  // sokcet.onclose = function () {
  //   console.log('WebSocket 连接断开')
  //   if (asrStr.value.length > 0) {
  //     if (asrStr.value.endsWith('，')) {
  //       asrStr.value = asrStr.value.slice(0, -1)
  //     }
  //     if (backFill.value) {
  //       updateStr(asrStr.value + '。')
  //     } else {
  //       updateStr('')
  //     }
  //     asrStr.value = ''
  //   }
  //   if (checkNeedReopen?.() && !reopenTimer) {
  //     reopenTimer = setTimeout(() => startRecording(''), 100)
  //   }
  // }

  // ws.value = sokcet
  // }

  const parseResult = (text: string) => {
    // const data = JSON.parse(res)
    // if (data.type == 'partial_result') {
    //   nbest = JSON.parse(data.nbest)
    //   const sentence = nbest[0].sentence
    //   if (sentence.length > 0) {
    //     // 每次识别的 sentence
    updateStr(asrStr.value + text.trim())
    //   }
    // } else if (data.type == 'final_result') {
    //   nbest = JSON.parse(data.nbest)
    //   const sentence = nbest[0].sentence
    //   if (sentence.length > 0) {
    //     asrStr.value += sentence + '，'
    //     updateStr(asrStr.value)
    //   }
    // }
  }

  const transferUpload = (number, blob: Blob, duration, blobRec, isClose) => {
    if (blob) {
      // const blob = blobOrNull
      // const reader = new FileReader()

      // reader.onloadend = function () {
      //   // console.log(reader.result)
      //   // ws.value?.send(reader.result)
      //   const buffer = Buffer.from(reader.result as ArrayBuffer);
      //   const base64String = buffer.toString('base64');

      //   console.log('base64String' + base64String)
      // }

      // reader.readAsArrayBuffer(blob)

      srInstantiation.value
        .blobToBase64(blob)
        .then((base64: string) => {
          asrRecongnition(base64)
        })
        .catch((error) => {
          console.error('转换出错:', error)
        })
    }
  }

  const asrRecongnition = async (base64String: string) => {
    try {
      isLoading.value = true
      const res = await postASRRecongnitionAPI(base64String, 'pcm')
      parseResult(res.data.data.text)
    } catch (error) {
      console.log(error)
    } finally {
      isLoading.value = false
    }
  }

  const startRecording = (str: string = '') => {
    try {
      isStart.value = true
      backFill.value = true
      asrStr.value = str

      // initRecognizer()
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
    // if (ws.value?.readyState === 1) {
    //   ws.value?.send(JSON.stringify({ signal: 'end' }))
    // }
    srInstantiation.value && srInstantiation.value.recordEnd()
    !latestSend && (backFill.value = latestSend)
    reopenTimer && clearTimeout(reopenTimer)
    isStart.value = false
    // const lastAsrStr = toRaw(asrStr.value)
    // if (lastAsrStr.endsWith('，')) {
    //   updateStr(lastAsrStr.slice(0, -1) + '。')
    // }
    // resetAsr()
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
    isLoading,
    startRecording,
    stopRecording,
    resetAsr
  }
}
