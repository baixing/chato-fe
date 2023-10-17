import { ELoginWay } from '@/enum/auth'

export const LoginWayConfig = {
  [ELoginWay.loginMobile]: '验证码登录',
  [ELoginWay.loginScanCode]: '扫码登录'
}

export const LoginCodeTip = [
  '1.如果是信号网络延迟，可稍后尝试重新获取',
  '2.查看是否误设了短信拦截',
  '3.联系运营商取消黑名单录',
  '4.若该号码欠费停机，建议您更换手机号码或缴费后重新获取'
]
