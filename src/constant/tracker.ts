// 正则匹配页面打点名称，考虑让数据层去做？
export const PageViewPathTracker = {
  '/': 'Chato_home_Pageview',
  '/case': 'Chato_case_page_view',
  '/nash': 'Chato_nash_page_view',
  '/auth/login': 'Chato_login',
  '/resource': 'Chato_resource',
  '\\/b\\/(\\w+)': 'Chato_bot_share_page_view',
  '\\/c\\/bot\\/(\\w+)': 'Chato_bot_page_view',
  '\\/t\\/bot\\/(\\d+)\\/roleInfo/base': 'Chato_manager_bot_user',
  '\\/t\\/bot\\/(\\d+)\\/roleInfo/advanced': 'Chato_manager_bot_persona',
  '\\/t\\/bot\\/(\\d+)\\/roleInfo/interface': 'Chato_manager_bot_interface',
  '\\/t\\/bot\\/(\\d+)\\/content\\/qa': 'Chato_manager_bot_content_qa',
  '\\/t\\/bot\\/(\\d+)\\/content\\/doc': 'Chato_manager_bot_content_doc',
  '\\/t\\/bot\\/(\\d+)\\/release': 'Chato_manager_bot_release',
  '\\/t\\/bot\\/(\\d+)\\/release\\/setting': 'Chato_manager_bot_release_setting',
  '\\/t\\/bot\\/(\\d+)\\/chat': 'Chato_manager_bot_content_chat',
  '\\/t\\/bot\\/(\\d+)\\/report': 'Chato_manager_bot_report',
  '\\/t\\/bot\\/(\\d+)\\/report\\/detail': 'Chato_manager_bot_report_detail',
  '/manager/center': 'Chato_manager_center',
  '/manager/create': 'Chato_manager_create'
}
