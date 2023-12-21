export const FULL_SITE_NAME = '阿旺'
export const SITE_NAME = '阿旺'
export const CHARO_SOURCE_RESOURCE = 'wx_mini_prog' // 资源广场-默认source
export const AWANG_SOURCE_WEB = 'awang-web' // 阿旺-网页
export const CHATO_SOURCE_SHARE = '阿旺' // 网页分享
export const CHATO_SOURCE_SHAKEDOWN = '阿旺' // 调试页面
export const CHATO_SOURCE_JS = '阿旺' // js嵌入
export const CHATO_SOURCE_PUBLIC = 'wx_mini_prog' // 微信公众号
export const CHATO_SOURCE_APPLET = 'wx_mini_prog' // 微信小程序
export const CHATO_SOURCE_APP = 'app_mini_prop' // 阿旺app
export const CHATO_APP_ID = 'wx627b77845363787d' // 纳什公众号id
export const CHATO_BAIXING_APP_ID = 'wx3e83c7262c068c6c' // Baixing AI 公众号id
export const CHATO_AWANG_SLUG = 'ge9p359y4v27d2oq' // 阿旺机器人
export const CHATO_AWANG_LOGO =
  'https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato_image/avater/40f870efd546f01feffd2c55d0d75c35.png' // 阿旺logo
export const CHATO_AWANG_BRAND_NAME =
  "关注<a src='javascript:;' class='theme-color'> 阿旺机器人 </a>公众号，免费无限次使用！"

export const UPLOAD_FILE_VIDEO_AUDIO_TYPES = [
  '.mp3',
  '.mp4',
  '.mpeg',
  '.m4a',
  '.wav',
  '.webm',
  '.epub'
]

export const UPLOAD_FILE_IMAGR_TYPES = ['.jpg', '.jpeg', '.png']

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
  ...UPLOAD_FILE_IMAGR_TYPES,
  ...UPLOAD_FILE_VIDEO_AUDIO_TYPES
]

export const UPLOAD_FILE_FORCED_CONVERSION_TO_TXT_TYPES = [
  ...UPLOAD_FILE_IMAGR_TYPES,
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

export const XIAONAQIWEI = 'https://work.weixin.qq.com/kfid/kfcc52fa33ded8ca483'
