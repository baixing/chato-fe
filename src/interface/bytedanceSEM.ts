// 定义与请求相关的接口
export interface IAdContext {
  callback: string
}

export interface IPromotionParams {
  event_type: string
  context: {
    ad: IAdContext
  }
  timestamp: number
}

export interface IResponseData {
  code: number
  message: string
}
