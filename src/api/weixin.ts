import type { ICeateAfficialAccountRes, ICreateAfficialAccountData } from '@/interface/release'
import request from '@/utils/request'

// 获取微信分享信息
export function getWeixinShare(params) {
  return request({
    url: `/chato/weixin_group/js_api_sign`,
    params
  })
}

// 绑定微信公众号
export function createAfficialAccount(slug_id: string, data: ICreateAfficialAccountData) {
  return request<ICeateAfficialAccountRes>({
    method: 'post',
    url: `/mp/manage/${slug_id}/save`,
    data
  })
}

// 查询当前绑定的微信公众号
// export function serachAfficialAccount(slug_id: string) {
//   return request<ICeateAfficialAccountRes[]>({
//     method: 'get',
//     url: `/mp/manage/${slug_id}`
//   })
// }
