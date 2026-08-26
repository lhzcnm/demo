import type { ServiceField, ServiceGroupCreateParams, ServiceCreateParams, UnlockCreateParams, Unlock, ServiceFieldForm } from '@/inters/services'
import type { UpstreamServiceForm } from '@/inters/services/upstream'
import type { Upstream } from '@/inters/upstream'
import type { IList, IK } from '@3un/shared'

// Service
export interface ServiceStore {
  upstreams: Upstream[]
  formBase: ServiceCreateParams
  formSearch: ServiceSearch
  formUpstream: UpstreamServiceForm
  visibleBase: boolean
  visibleField: boolean
  visibleUpstream: boolean
  index: number | undefined
}

interface ServiceSearch {
  categoryId: number | null
  keyword: string
}

// ServiceGroup
export interface ServiceGroupStore {
  formBase: ServiceGroupCreateParams
  visibleBase: boolean
  index: number | undefined
}

// ServiceField
export interface ServiceFieldStore {
  fields: IList<ServiceField>

  formBase: ServiceFieldForm
  visibleBase: boolean
  visibleCreate: boolean

  refresh: boolean
  loading: boolean
  index  : number | undefined
  page   : number
  limit  : number
  serviceId: number | undefined
}

// Unlock
export interface UnlockStore {
  unlocks: Unlock[]

  formBase: UnlockCreateParams

  visibleBase: boolean
  visibleConvert: boolean

  refresh: boolean

  index: number | undefined
}

// Store
export const SERVICE_STORE: IK<ServiceStore> = Symbol('service')
export const GROUP_STORE: IK<ServiceGroupStore> = Symbol('group')
export const FIELD_STORE: IK<ServiceFieldStore> = Symbol('field')
export const UNLOCK_STORE: IK<UnlockStore> = Symbol('unlock')
