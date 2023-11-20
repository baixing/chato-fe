import type {
  ICUserBuyProductionDetail,
  ICUserBuyProductionParams,
  IOrderPackage,
  IOrderPaymentCode,
  IOrderPaymentStatus,
  IUserSettingOrderPayment
} from '@/interface/order'
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

// ---- 用户自定义套餐 ----
export function getUserPackageListAPI(slug: string) {
  return request({
    url: `/chato/api/v2/domains/${slug}/customer/package`
  })
}

export function postUserPackageAPI(slug: string, data: IUserSettingOrderPayment) {
  return request({
    method: 'post',
    url: `/chato/api/v2/domains/${slug}/customer/package`,
    data
  })
}

export function postPurchaseProductionAPI(slug: string, data: ICUserBuyProductionParams) {
  return request<IOrderPaymentCode>({
    method: 'post',
    url: `/chato/api/v2/domains/${slug}/customer/payment`,
    data
  })
}

export function postPurchaseHistoryProductionAPI(slug: string, customer_uuid: string) {
  return request({
    url: `/chato/api/v2/domains/${slug}/customer/payment/list`,
    data: { customer_uuid }
  })
}

export function getPurchaseOrderStatus(orderId: number, customer_uuid: string, slug: string) {
  return request({
    url: `/chato/api/v2/domains/${slug}/customer/order/${orderId}/info`,
    data: { customer_uuid }
  })
}

export function getPurchaseToBResultListAPI(slug: string) {
  return request({
    url: `/chato/api/v2/domains/${slug}/payment/list`
  })
}

export function getPurchaseToBIncome() {
  return request<ICUserBuyProductionDetail[]>({
    url: `/chato/api/v2/domains/customer/payment/income`
  })
}
// ------
