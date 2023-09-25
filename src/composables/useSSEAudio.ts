import { getTTS } from '@/api/chat'
import { ChatMessageFinalStatus } from '@/constant/chat'
import type { ITTSParams } from '@/interface/tts'
import { useAudioStore } from '@/stores/audio'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'

export default function useSSEAudio() {
  let sseText = ''
  const sseTextArr: ITTSParams[] = []
  let ttsSyncIndex = 0
  let ttsPending = false

  const audioStoreI = useAudioStore()
  const { audioRef, audioPlayingId, audioLoading, audioListMap, audioPlaying } =
    storeToRefs(audioStoreI)

  const finalSymbol = ['.', ',', '!', '?', ';', '。', '，', '！', '？', '；']

  const SSETextToAudio = ({
    sseRes,
    domainSlug,
    token,
    finishReason
  }: {
    sseRes: any
    domainSlug: string
    token: string
    finishReason?: string
  }) => {
    const { chunk_message: chunkText, status, question_id } = sseRes
    const playerId = `${question_id}_a`
    audioPlayingId.value = playerId
    if (!audioListMap.value.has(playerId)) {
      audioLoading.value = true
      audioStoreI.initAudioListByPlayerId(playerId)
    }
    const isFinish = finishReason || ChatMessageFinalStatus.includes(status)
    if (finalSymbol.includes(chunkText) || isFinish) {
      const textStr = isFinish ? sseText : `${sseText}。`
      sseText = ''
      sseTextArr.push({
        text: textStr,
        audio_key: playerId,
        domain_slug: domainSlug,
        token,
        finish_reason: isFinish ? 'done' : undefined
      })
      if (!ttsPending) {
        ttsQueue()
      }
    } else {
      sseText += chunkText
    }
  }

  const ttsQueue = async () => {
    ttsPending = true
    while (ttsSyncIndex >= 0 && ttsSyncIndex < sseTextArr.length) {
      await ttsText(sseTextArr[ttsSyncIndex])
      ttsSyncIndex++
    }
  }

  const ttsText = async (params: ITTSParams) => {
    try {
      ttsPending = true
      const {
        data: { data }
      } = await getTTS(params)
      const ttsUrlList = (data?.contentList || []).map((item) => item.url)
      if (!ttsUrlList.length) {
        return
      }
      audioStoreI.addAudioListByPlayer(params.audio_key, ttsUrlList)
      audioStoreI.$patch({ audioLoading: false })
      // nextTick(() => {
      //   if (audioRef.value?.src) {
      //     audioRef.value.paused && audioRef.value.play()
      //   } else {
      //     ElMessage.warning('语音文件获取失败')
      //     audioRef.value?.pause()
      //   }
      // })
    } catch (err) {
      audioPlaying.value = false
      ElMessage.warning('出现了未知的错误，再试试')
      throw `tts error: ${err.message}`
    } finally {
      ttsPending = false
    }
  }

  return {
    SSETextToAudio
  }
}
