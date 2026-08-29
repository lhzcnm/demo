import type { Upstream, UpstreamCreateParams } from '@/inters/upstream'
import type { IK } from '@3un/shared'

export const UPSTREAM_STORE: IK<UpstreamStore> = Symbol('upstream')

export interface UpstreamStore {
  upstreams: Upstream[]

  formBase: UpstreamCreateParams
  visibleBase: boolean

  index: number | undefined
  refresh: boolean
}
