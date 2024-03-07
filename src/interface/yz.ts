export interface IYouzanUserData {
  additions: IYouzanUserAddions
  created: string
  id: number
  user_id: number
  default_auth_token: string
}

export interface IYouzanUserAddions {
  app_id: number
  code: string
  kdt_id: number
  phone: string
  shop_name: string
  shop_role: number
  shop_type: number
  user_id: number
  yz_open_id: string
}

export interface IYouzanProducts {
  share_title: string
  sub_title: string
  title: string
  price: number
  item_id: number
  alias: string
  created_time: string
  share_icon: string
  image: string
  detail_url: string
  chato_domain?: number
}
