import type { EUserOrganizationRole } from '@/enum/userInformation'

export interface IUserIdentity {
  organization_type?: EUserOrganizationRole
  surname?: string
  company?: string
}

export interface IFirstGuideSelectDataConfig extends IUserIdentity {
  industry: string[] | string
  interests: string[]
}
