// 页面展示端标识
export const enum ETerminal {
  B = 'B', // B 端
  C = 'C' // C 端
}

// 命中风控字段
export enum EFengkongField {
  content = '广播语',
  nickname = '昵称中',
  avatar = '头像中',
  system_prompt = '角色描述中',
  keyword_block_reply = '触发时默认回复中',
  keyword_block = '关键词回复中',
  name = '名称中',
  welcome = '欢迎语中',
  title = '问题中',
  content_html = '答案中',
  desc = '机器人简介中',
  brand_name = '品牌包装中',
  ad_content = '对话广告中',
  rate_limit = '按使用频率超出默认会出中',
  quota_limit = '按使用量超出默认会出中',
  shortcuts_0_title = '菜单栏第一条关键词中',
  shortcuts_0_response = '菜单栏第一条回复内容中',
  shortcuts_1_title = '菜单栏第二条关键词中',
  shortcuts_1_response = '菜单栏第二条回复内容中',
  shortcuts_2_title = '菜单栏第三条关键词中',
  shortcuts_2_response = '菜单栏第三条回复内容中'
}
