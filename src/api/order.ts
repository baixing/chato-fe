import type { IOrderPackage, IOrderPaymentCode, IOrderPaymentStatus } from '@/interface/order'
import request from '@/utils/request'

// 套餐列表
export function getOrderPackageList() {
  return request<IOrderPackage[]>({
    method: 'get',
    url: `/chato/api/package/order/list_package`
  })
}

export function getOrderPackagePaymentCode(data: {
  package_id: number
  payment_price: number
  pay_type: number
}) {
  return request<IOrderPaymentCode>({
    method: 'post',
    url: `/chato/api/package/order/create_order_and_payment`,
    data
  })
}

export function refreshPaymentStatus(order_id: number) {
  return request<IOrderPaymentStatus>({
    method: 'get',
    url: `/chato/api/package/order/${order_id}`
  })
}
