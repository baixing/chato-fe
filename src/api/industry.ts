import request from '@/utils/request'
import type { IFirstGuideIndustry } from '@/interface/industry'

// 新用户注册表单-提交
export function saveFirstGuideIndustry(data: IFirstGuideIndustry) {
  return request<IFirstGuideIndustry>({
    method: 'post',
    url: '/chato/api/v1/org/additions/save',
    data
  })
}

// 新注册用户表单-行业+问题
// getFirstGuideSelect
export function getFirstGuideIndustry() {
  return request({
    url: '/chato/api/v1/org/industry_select_config'
  })
}
