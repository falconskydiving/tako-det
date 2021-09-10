import { Member } from '../../entities'

export interface CreateMember {
  memberId: string
  userId: string
}

export class MemberModel {
  public id?: number
  public membershipId: number
  public userId: number
  public created: Date
  public updated: Date

  constructor(member: Member) {
    this.id = member.id
    this.membershipId = member.membershipId
    this.userId = member.userId
    this.created = member.created
    this.updated = member.updated
  }
}
