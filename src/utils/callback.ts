import useChannel from '@/composables/useChannel'
import { BAIDU_TOKEN } from '@/constant/common'
import dayjs from 'dayjs'

// 抖音回传
export const douYinCallbackAPI = (id, callback) => {
  callback()
  fetch('https://awang.chato.cn/api/v2/conversion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // 告诉服务器我们正在发送JSON数据
    },
    body: JSON.stringify({
      event_type: 'form',
      context: {
        ad: {
          callback: id
        }
      },
      timestamp: dayjs().valueOf()
    })
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error('Error:', error))
}

// 百度api回调
export const baiduCallbackAPI = (bxId: string, callback) => {
  const { shareChannel } = useChannel()
  callback()
  fetch('https://awang.chato.cn/ocpcapi/api/uploadConvertData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // 告诉服务器我们正在发送JSON数据
    },
    body: JSON.stringify({
      token: BAIDU_TOKEN[location.hostname],
      conversionTypes: [
        {
          logidUrl: `https://${location.hostname}?channel=${shareChannel.value}&bd_vid=${bxId}`,
          newType: 1
        }
      ]
    })
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error('Error:', error))
}
