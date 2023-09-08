import { EAfficialAccountStatusType, ECreatePublicType, EWeixinConfigType } from '@/enum/release'

export const ChannelStatusTiktok = {
  [EAfficialAccountStatusType.normal]: '解除授权',
  [EAfficialAccountStatusType.disabled]: '重新授权',
  [EAfficialAccountStatusType.deleted]: '重新授权'
}

export const EWeixinConfigText = {
  [EWeixinConfigType.url]: '回调URL',
  [EWeixinConfigType.token]: 'Token',
  [EWeixinConfigType.encoding_aes_key]: 'EncodingAESKey',
  [EWeixinConfigType.app_id]: '企业ID',
  [EWeixinConfigType.app_secret]: 'Secret'
}

export const ECreatePublicText = {
  [ECreatePublicType.create]:
    '点击「确认」后，群聊额度会扣除。创建新群后，群主为系统分配的建群机器人，且不可转让。',
  [ECreatePublicType.invite]:
    '点击「确认」后，机器人会自动进入群聊中，群聊额度会扣除。创建新群后，群主为系统分配的建群机器人，且不可转让。',
  [ECreatePublicType.friends]:
    '添加机器人为好友，机器人会自动通过，群聊额度会扣除。创建新群后，群主为系统分配的建群机器人，且不可转让。'
}
