import type { IJSAPISignParams } from '@/interface/order'

export const payJSAPI = (params: IJSAPISignParams) => {
  return new Promise((resolve) => {
    function onBridgeReady() {
      window.WeixinJSBridge.invoke('getBrandWCPayRequest', { ...params }, function (res) {
        resolve(res.err_msg === 'get_brand_wcpay_request:ok')
      })
    }
    if (typeof window.WeixinJSBridge == 'undefined') {
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false)
      } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady)
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady)
      }
    } else {
      onBridgeReady()
    }
  })
}
