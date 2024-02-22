import type {
  ICUserBuyProductionDetail,
  ICUserBuyProductionParams,
  IOrderPaymentCode
} from '@/interface/order'
import request from '@/utils/request'

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

export function postPurchaseProductionAPI(slug: string, data: ICUserBuyProductionParams) {
  return request<IOrderPaymentCode>({
    method: 'post',
    url: `/chato/api/v2/domains/${slug}/customer/payment`,
    data
  })
}

export function getPurchaseToBIncome() {
  return request<ICUserBuyProductionDetail[]>({
    url: `/chato/api/v2/domains/customer/payment/income`
  })
}
// ------
