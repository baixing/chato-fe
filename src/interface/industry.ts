import type { IUserIdentity } from './user'

export interface IFirstGuideIndustry extends IUserIdentity {
  industry: string[] | string
  interests: string[]
}
