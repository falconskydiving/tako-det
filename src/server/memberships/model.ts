import { Membership } from '../../entities'

export interface CreateMembership {
  levelId: number
  userId: number
}

export interface UpdateMembership {
  levelId: number
  active: boolean
}

export class MembershipModel {
  public id?: number
  public levelId: number
  public active: boolean
  public userId: number
  public statistics: any
  public created: Date
  public updated: Date

  constructor(membership: Membership) {
    this.id = membership.id
    this.levelId = membership.levelId
    this.active = membership.active
    this.userId = membership.userId
    this.statistics = membership.statistics
    this.created = membership.created
    this.updated = membership.updated
  }
}
