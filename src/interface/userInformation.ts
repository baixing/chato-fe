import type { EUserOriganizationRole } from '@/enum/userInformation'

export interface IUserIdentity {
  origanization_type?: EUserOriganizationRole
  surname?: string
  company?: string
}

export interface firstGuideSelectDataConfig extends IUserIdentity {
  industry: string[] | string
  interests: string[]
}
