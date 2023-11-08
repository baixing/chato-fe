import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'

export const SpaceRightsLimitTips = {
  [ESpaceRightsType.bot]: ['联系产品顾问进一步解锁更多资源。'],
  [ESpaceRightsType.quota]: ['增加电力值后可继续会话，或联系产品顾问进一步解锁更多资源。'],
  [ESpaceRightsType.paintQuota]: ['增加图像值后可继续会话，或联系产品顾问进一步解锁更多资源。'],
  [ESpaceRightsType.usage]: ['联系产品顾问获取最新套餐折扣。'],
  [ESpaceRightsType.space]: ['联系产品顾问进一步解锁更多资源。'],
  [ESpaceRightsType.groupChatFree]: ['联系产品顾问进一步解锁更多资源。'],
  [ESpaceRightsType.groupChat]: ['联系产品顾问进一步解锁更多资源。'],
  [ESpaceRightsType.brand]: ['联系产品顾问进一步解锁高级能力。'],
  [ESpaceRightsType.default]: ['联系产品顾问获取最新套餐折扣。'],
  [ESpaceRightsType.weixinAccount]: ['联系产品顾问获取创建账号的能力。']
}

// 付费权益版本
export const PaidCommercialTypes = [
  ESpaceCommercialType.standard,
  ESpaceCommercialType.brand,
  ESpaceCommercialType.professional,
  ESpaceCommercialType.customVip1,
  ESpaceCommercialType.customVip2,
  ESpaceCommercialType.customVip3,
  ESpaceCommercialType.ka
]

export const SpaceCommercialTypeMapper = {
  [ESpaceCommercialType.free]: '免费版',
  [ESpaceCommercialType.standard]: '标准版',
  [ESpaceCommercialType.brand]: '品牌版',
  [ESpaceCommercialType.professional]: '旗舰版',
  [ESpaceCommercialType.customVip1]: '高级定制版',
  [ESpaceCommercialType.customVip2]: '高级定制版',
  [ESpaceCommercialType.customVip3]: '高级定制版',
  [ESpaceCommercialType.ka]: '专享版'
}

export const FreeCommercialTypeExperienceDay = 3
