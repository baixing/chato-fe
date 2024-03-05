import type { IYouzanProducts, IYouzanUserData } from '@/interface/yz'
import request from '@/utils/request'

// 有赞登录态
export function getYouzanUser(newUserToken: string) {
  return request({
    url: `/chato/api/v1/youzan/login`,
    params: {
      newUserToken
    }
  })
}

// 有赞商品列表
export function getYouzanProductList(store_id: number, page: number, page_size: number) {
  return request<{ count: number; items: IYouzanProducts[] }>({
    url: `/chato/api/v1/youzan/${store_id}/products`,
    params: {
      page,
      page_size
    }
  })
}

// 创建有赞机器人
export function createYouzanRobot(store_id: number, alias: string) {
  return request({
    url: `/chato/api/v1/youzan/${store_id}/domain/${alias}/create`,
    method: 'post'
  })
}

// 查询有赞用户
export function serachYouzanUserInfoAPI() {
  return request<IYouzanUserData>({
    url: `/chato/api/v1/youzan/user_data`
  })
}
