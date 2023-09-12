import request from '@/utils/request'
import type { firstGuideSelectDataConfig } from '@/interface/userInformation'

// 新用户注册表单-提交
export function postFirstGuideSelect(data: firstGuideSelectDataConfig) {
  return request<firstGuideSelectDataConfig>({
    method: 'post',
    url: '/chato/api/v1/org/additions/save',
    data
  })
}

// 新注册用户表单-行业+问题
export function getFirstGuideSelect() {
  return request({
    url: '/chato/api/v1/org/industry_select_config'
  })
}
