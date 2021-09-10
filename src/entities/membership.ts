export interface Membership {
  id?: number
  userId: number
  levelId: number
  active: boolean
  statistics?: any
  created: Date
  updated: Date
}
