import type {
  IChatCheckMobileRes,
  IH5LoginAuthParams,
  ILoginParams,
  ILoginQRCodeEmpowerResult,
  ILoginQRCodeResult,
  ILoginQRCodeSerachParams,
  IWeixinH5LoginParams,
  IWeixinH5LoginRes
} from '@/interface/auth'
import type { IJSAPISignRes } from '@/interface/order'
import request from '@/utils/request'

export function postSendSmsCodeAPI(mobile: string, channel?: string) {
  return request({
    method: 'post',
    url: `/chato/api/auth/sendVerificationCode`,
    data: { mobile, channel }
  })
}

export function postLoginAPI(data: ILoginParams) {
  return request({
    method: 'post',
    url: `/chato/api/v1/user/auth/login`,
    data
  })
}

export function getLoginQRCodeAPI() {
  return request<ILoginQRCodeResult>({
    url: '/chato/api/v1/login/get_wx_public_qr_code'
  })
}

export function getLoginQREmpowerStatusAPI(params: ILoginQRCodeSerachParams) {
  return request<ILoginQRCodeEmpowerResult>({
    url: '/chato/api/v1/login/get_wx_public_login_status',
    params
  })
}

export function postBindingMobileAPI(data: ILoginParams) {
  return request({
    method: 'post',
    url: '/chato/api/v1/login/bind_mobile',
    data
  })
}

// 注销账户
export function logoutAccount() {
  return request({
    method: 'post',
    url: `/chato/api/v1/user/logout`
  })
}

// C端登录
export function postLoginCAPI(data: ILoginParams) {
  return request({
    method: 'post',
    url: '/chato/api/v1/login/customer_user',
    data
  })
}

// C端校验
export function postCheckLoginCAPI(slug: string, uid: string) {
  return request<IChatCheckMobileRes>({
    url: `/chato/api/v1/login/customer_user/${slug}`,
    data: { sender_uid: uid }
  })
}

// 获取H5授权链接
export function getH5AuthAPI(params: IH5LoginAuthParams) {
  return request({
    url: '/chato/api/v1/login/get_auth_url_for_wechat_h5',
    params
  })
}

// 微信H5登录
export function postWeixinH5Login(data: IWeixinH5LoginParams) {
  return request<IWeixinH5LoginRes>({
    method: 'post',
    url: '/chato/api/v1/login/login_by_wechat_h5',
    data
  })
}

// jsapi 支付签名
export function getJsApiPaySignAPI(prepayId: string) {
  return request<IJSAPISignRes>({
    url: '/chato/api/package/order/sign',
    params: { prepay_id: prepayId }
  })
}
