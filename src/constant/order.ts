import { EOrderPaymentStatus } from '@/enum/order'

export const OrderPaymentStatus = {
  [EOrderPaymentStatus.close]: '订单已关闭',
  [EOrderPaymentStatus.paying]: '订单支付中',
  [EOrderPaymentStatus.paid]: '订单支付成功',
  [EOrderPaymentStatus.finish]: '订单已完成',
  [EOrderPaymentStatus.request_refund]: '订单申请退款中',
  [EOrderPaymentStatus.refunding]: '订单退款中',
  [EOrderPaymentStatus.refund_failed]: '订单退款失败',
  [EOrderPaymentStatus.refund_finish]: '订单退款完成',
  [EOrderPaymentStatus.pay_failed]: '订单支付失败'
}
