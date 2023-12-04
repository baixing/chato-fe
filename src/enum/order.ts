export enum EOrderPackageType {
  base = 'base',
  extra = 'extra',
  buffet = 'buffet'
}

export enum EOrderPaymentStatus {
  close = 'close',
  paying = 'paying',
  paid = 'paid',
  finish = 'finish',
  request_refund = 'request_refund',
  refunding = 'refunding',
  refund_finish = 'refund_finish',
  pay_failed = 'pay_failed',
  refund_failed = 'refund_failed'
}

export enum EWeixinH5LoginType {
  normal = 'normal',
  customer = 'customer'
}
