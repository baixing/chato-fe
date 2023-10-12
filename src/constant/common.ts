export const FULL_SITE_NAME = 'Chato - 基于AI技术 轻松创建对话机器人'
export const SITE_NAME = 'Chato'
export const CHARO_SOURCE = 'Chato_main_web'
export const CHARO_SOURCE_PC = 'Chato_main_web_pc'
export const CHARO_SOURCE_WAP = 'Chato_main_web_wap'
export const CHATO_SHARE_SOURCE = 'Chato_share_web'
export const CHATO_SHARE_SOURCE_PC = 'Chato_share_web_pc'
export const CHATO_SHARE_SOURCE_WAP = 'Chato_share_web_wap'

export const UPLOAD_FILE_VIDEO_AUDIO_TYPES = [
  '.mp3',
  '.mp4',
  '.mpeg',
  '.m4a',
  '.wav',
  '.webm',
  '.epub'
]

export const UPLOAD_FILE_TYPES = [
  '.pdf',
  '.docx',
  '.txt',
  '.pptx',
  '.epub',
  '.md',
  '.csv',
  '.mobi',
  '.xlsx',
  ...UPLOAD_FILE_VIDEO_AUDIO_TYPES
]

export const UPLOAD_TEMPLATE_FILE_TYPES = ['.xls', '.xlsx']

export const USER_ROLES = {
  SUPERMAN: 'superman',
  OWNER: 'owner',
  MEMBER: 'member',
  ADMIN: 'admin'
}

export const MANGER_ROLES = ['superman', 'owner', 'admin']

export const EMAIL_REG =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const MOBILE_REG =
  /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/
