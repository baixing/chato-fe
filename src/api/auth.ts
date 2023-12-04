import type {
  IChatCheckMobileRes,
  ILoginParams,
  ILoginQRCodeEmpowerResult,
  ILoginQRCodeResult,
  ILoginQRCodeSerachParams
} from '@/interface/auth'
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

export function getCheckChannelAPI(params: { code: string }) {
  return request({
    url: `/chato/api/v1/inviter_channels/check_code`,
    params: params
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
