export const FULL_SITE_NAME = 'Chato - 基于AI技术 轻松创建对话机器人'
export const SITE_NAME = 'Chato'
export const CHARO_SOURCE_RESOURCE = 'Chato_resource_web' // 资源广场-默认source
export const CHATO_SOURCE_SHARE = 'Chato_share_web' // 网页分享
export const CHATO_SOURCE_SHAKEDOWN = 'Chato_shakedown_web' // 调试页面
export const CHATO_SOURCE_JS = 'Chato_share_js' // js嵌入
export const CHATO_SOURCE_PUBLIC = 'mp_menu' // 微信公众号
export const CHATO_SOURCE_APPLET = 'wx_mini_prog' // 微信小程序
export const CHATO_APP_ID = 'wx627b77845363787d' // 纳什公众号id
export const CHATO_BAIXING_APP_ID = 'wx92fe4cf09c662ede' // Baixing AI 公众号id

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

export const RGBList = [
  'rgb(251,144,120)',
  'rgb(167,171,176)',
  'rgb(252 211 77)',
  'rgb(45 212 191)',
  'rgb(147 197 253)',
  'rgb(129 140 248)',
  'rgb(167 139 250)'
]

export const SUPPORT_LLM_CONFIG = [
  {
    name: 'Default Model (推荐)',
    type: '7e78bce4872633c2',
    consume_quota: 1,
    need_vip: false
  },
  {
    name: '文心一言',
    type: 'd389c001a3062589',
    consume_quota: 1,
    need_vip: false
  },
  {
    name: 'MiniMax',
    type: 'c2c4ab7e59416333',
    consume_quota: 1,
    need_vip: false
  },
  {
    name: '智谱 ChatGLM',
    type: '83a97b9669d3532c',
    consume_quota: 1,
    need_vip: false
  },
  {
    name: '讯飞星火',
    type: 'lz5xd7nxqx3wq48k',
    consume_quota: 1,
    need_vip: false
  },
  {
    name: '通义千问',
    type: 'r1f8oq4bbi1vm7qd',
    consume_quota: 1,
    need_vip: false
  },
  {
    name: '字节云雀',
    type: 'vqm82eeej2p18aft',
    consume_quota: 1,
    need_vip: false
  },
  {
    name: '百川大模型',
    type: 'zidclfs9i0oc55gu',
    consume_quota: 1,
    need_vip: false
  },
  {
    name: 'moonshot',
    type: '6bz8LxU4p9YQv3Tw',
    consume_quota: 1,
    need_vip: false
  },
  {
    name: 'claude',
    type: '4mF7gHnXj5sK8qZw',
    consume_quota: 1,
    need_vip: false
  },
  {
    name: 'Advanced Model',
    type: 'e640dbec16b891d9',
    consume_quota: 40,
    need_vip: true
  }
]

export const CATEGORYLIST = [
  '语言模型',
  '数字分身',
  '数字员工',
  '营销助手',
  '办公写作',
  '行业顾问',
  '创意灵感',
  '生活方式',
  '人力资源',
  '技术专家'
]

export const INDUSTRYLIST = [
  '信息传输、软件和信息技术服务业',
  '科学研究和技术服务业',
  '教育',
  '金融业',
  '房地产业',
  '批发和零售业',
  '建筑业',
  '交通运输、仓储和邮政业',
  '住宿和餐饮业',
  '租赁和商务服务业',
  '水利、环境和公共设施管理业',
  '居民服务、修理和其他服务业',
  '卫生和社会工作',
  '文化、体育和娱乐业',
  '公共管理、社会保障和社会组织',
  '国际组织',
  '制造业',
  '农、林、牧、渔业',
  '采矿业',
  '电力、热力、燃气及水生产和供应业',
  '其他'
]

export const INDUSTRYSELECTCONFIG = {
  industry: [
    '科技产业',
    '互联网',
    '软件开发',
    '教育',
    '金融保险',
    '医疗',
    '建筑房产',
    '电商',
    '自媒体',
    '广告传媒',
    '咨询',
    '商务服务',
    '生活服务',
    '汽车',
    '文体娱乐',
    '营销',
    '交通物流',
    '餐饮业',
    '旅游',
    '政务',
    '消费品',
    '工业制造',
    '其他'
  ],
  interest: [
    '工作效率优化',
    '产品营销获客',
    '产品售后服务',
    '内部知识问答',
    '客户关系服务',
    '产品咨询',
    '客户意见收集',
    '线上客户服务',
    '公众号客服',
    '抖音/小红书客服',
    '淘宝/京东电商客服',
    '个人IP分身',
    '线上教育服务',
    '课程售后服务',
    '电商获客',
    '其他'
  ],
  job: [
    'CEO/总裁',
    '经理/总监/业务负责人',
    '项目经理',
    '产品经理',
    '运营专员',
    '市场专员',
    '研发工程师',
    '数据分析师',
    '设计师',
    '行业专家',
    '自媒体人',
    '销售/客服人员',
    '财务/采购',
    'HR/行政',
    '个人',
    '其他'
  ]
}

export const TTSTIMBE = {
  timbres: ['zh_female_qingxin', 'zh_female_qiaopi', 'zh_male_chunhou', 'zh_male_qinqie'],
  descriptions: ['晓晓-女-清新', '依依-女-俏皮', '齐光-男-醇厚', '小川-男-亲切']
}
