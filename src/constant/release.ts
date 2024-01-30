import { EActivateGroupType, EAfficialAccountStatusType, EWeixinConfigType } from '@/enum/release'

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

export const RUseTipAddTip = [
  'a.使用企业微信扫码后添加机器人为好友，将机器人拉入企业微信创建的群中，使用激活码激活',
  'b.若机器人已是好友、已在群中，任意用户在群内发送激活码即可激活',
  "c.激活机器人后，在群内{'@'}机器人提问"
]

export const RUseTipCreateTip = [
  '1.不能与机器人单独聊天',
  '2.机器人只能在加入的第一个群里生效',
  "3.{'@'}机器人提问，机器人即可自动回复"
]

export const RUseTipCreateSingleTip = [
  '1.扫码后添加机器人为好友，使用Token激活',
  '2.若机器人已是好友，任意用户发送Token即可激活',
  '3.每天好友上限60个；超出后无法成为好友，可第二天添加；总量上限5000个',
  '4.激活后，直接和机器人1对1聊天'
]

export const RCreateAccountSuccessTip = [
  '1.一个账号最多服务5-10群；需要自行承担被封号的风险',
  '2.扫码后，不要在除手机外的设备上异地登录',
  '3.若机器人回复异常，请在「查看账号」中重新扫码登录',
  '4.扫码后，即使关闭网页或电脑，云端电脑将24小时在线',
  '5.不要退出企微上方的 [Windows已登录]',
  '6.不要在企微手机端 [退出登录]/ [切换企业]'
]

export const RCreateAccountFormTip = [
  '对外服务时，使用您的企业名称作为机器人后缀',
  '1.建议您使用不常用的企微扫码',
  '2.扫码后，你的企微将登录在 Chato 云端电脑上',
  '3.扫码后，不要在除手机外的设备上异地登录'
]

export const RGroupChatListTip = [
  '1.扫码后添加机器人为好友，将机器人拉入群中，使用Token激活',
  '2.若机器人已是好友、已在群中，任意用户在群内发送Token即可激活',
  "3.激活机器人后，在群内{'@'}机器人提问",
  '4.勿在企微中更改机器人群昵称，更改会导致机器人不回复；如需更改，请前往「形象」更改'
]

export const RActivedGroupTipConfig = {
  [EActivateGroupType.joinGroupChat]: RUseTipAddTip,
  [EActivateGroupType.createGroupChat]: RUseTipCreateTip,
  [EActivateGroupType.singleGroupChat]: RUseTipCreateSingleTip
}

export const RActivedGroupTitleConfig = {
  [EActivateGroupType.joinGroupChat]: '激活机器人',
  [EActivateGroupType.singleGroupChat]: '单聊激活'
}

export const RGroupStatus = {
  1: '活跃',
  2: '禁言'
}

export const RActivedGroupTokenConfig = {
  [EActivateGroupType.joinGroupChat]: '激活码',
  [EActivateGroupType.singleGroupChat]: 'Token'
}

export const REmpowerAppletIllustrate = [
  '将机器人绑定到企业的自有小程序，页面为机器人对话界面，小程序仍隶属于企业。'
]

export const REmpowerAppletUseInstruction = [
  '1.请确保绑定的小程序为全新或已闲置，<strong>授权后其类目和页面都将被覆盖</strong>。',
  '2.<strong>个人类型</strong>的小程序存在较大不稳定性，可能因为包含外链导致无法过审或使用。',
  "3.审核不通过或下架的情况无法完全规避，具体请参考 <a class='theme-color' target='_blank' href='https://developers.weixin.qq.com/miniprogram/product'>「微信小程序运营规范」</a>。",
  "4.目前没有可用的小程序？可查看<a class='theme-color' target='_blank' href='https://baixingwang.feishu.cn/docx/C2shd2MHfo7aPfxkUl8cJVJMnGf'>「配置微信小程序教程」</a>"
]
