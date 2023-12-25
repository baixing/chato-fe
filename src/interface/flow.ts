import type { IDomainInfo } from './domain'

export interface IFlow {
  id: number
  name: string
  desc: string
  org_id: number
}

export interface IIntention {
  id: number
  name: string
  node_prompt: string
  parent_node_id: number
  sop_flow_id: number
  domain_id: number
  domain: IDomainInfo
}
