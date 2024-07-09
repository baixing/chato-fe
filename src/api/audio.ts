import request from '@/utils/request'

export function postASRRecongnitionAPI(audio: string, voice_format: string) {
  return request({
    method: 'post',
    url: `/chato/api/v1/asr/recognition`,
    data: {
      audio,
      voice_format
    }
  })
}
// ------
