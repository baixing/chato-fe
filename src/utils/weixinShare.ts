import { getWeixinShare } from '@/api/weixin'
import wx from 'weixin-js-sdk'

interface ShareObj {
  title: string
  link: string
  desc: string
  imgUrl: string
}

const setWxConfig = (appId: string, timestamp: number, nonceStr: string, signature: string) => {
  wx.config({
    debug: false,
    appId: appId,
    timestamp: timestamp,
    nonceStr: nonceStr,
    signature: signature,
    jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData', 'onMenuShareWeibo']
  })
}

const setReady = () => {
  return new Promise((resolve, reject) => {
    wx.ready(() => {
      resolve(wx)
    })
    wx.error(function (err) {
      reject(wx)
    })
  })
}

const shareWeixin = async (shareObj) => {
  const res = await getWeixinShare({ url: shareObj.link })
  const { nonce_str, sign, timestamp } = res.data.data
  setWxConfig('wx6452096cc6a98092', timestamp, nonce_str, sign)
  setReady()
    .then((wx: any) => {
      wx.ready(function () {
        // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容
        wx.updateAppMessageShareData({
          title: shareObj.title, // 分享标题
          link: shareObj.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          desc: shareObj.desc, // 分享描述
          imgUrl: shareObj.imgUrl, // 分享图标
          trigger: function (res) {
            // alert('用户点击分享到朋友圈');
          },
          success: function (res) {
            // alert('已分享');
          },
          cancel: function (res) {
            // alert('已取消');
          },
          fail: function (res) {
            // alert(JSON.stringify(res))
          }
        })
        // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容
        wx.updateTimelineShareData({
          title: shareObj.title, // 分享标题
          link: shareObj.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          desc: shareObj.desc, // 分享描述
          imgUrl: shareObj.imgUrl, // 分享图标
          trigger: function (res) {
            // alert('用户点击分享到朋友圈');
          },
          success: function (res) {
            // alert('已分享');
          },
          cancel: function (res) {
            // alert('已取消');
          },
          fail: function (res) {
            // alert(JSON.stringify(res))
          }
        })
        // 获取“分享到腾讯微博”按钮点击状态及自定义分享内容接口
        wx.onMenuShareWeibo({
          title: shareObj.title, // 分享标题
          link: shareObj.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          desc: shareObj.desc, // 分享描述
          imgUrl: shareObj.imgUrl, // 分享图标
          trigger: function (res) {
            // alert('用户点击分享到朋友圈');
          },
          success: function (res) {
            // alert('已分享');
          },
          cancel: function (res) {
            // alert('已取消');
          },
          fail: function (res) {
            // alert(JSON.stringify(res))
          }
        })
      })
    })
    .catch((e) => {
      console.log(e)
    })
}

export default shareWeixin
