import { Member } from '../entities'
import { MemberRepository } from '../repositories'

export class MemberManager {
  private repo: MemberRepository

  constructor(repo: MemberRepository) {
    this.repo = repo
  }

  public find(userId: number, id: number): Promise<Member> {
    return this.repo.find(userId, id)
  }

  public async findUserMembers(
    userId: number,
    limit?: number,
    offset?: number
  ): Promise<Member[]> {
    return this.repo.findByUser(userId, limit, offset)
  }

  public async findMembershipMembers(
    membershipId: number,
    limit?: number,
    offset?: number
  ): Promise<Member[]> {
    return this.repo.findByMembership(membershipId, limit, offset)
  }

  public create(member: Member): Promise<Member> {
    return this.repo.insert(member)
  }

  public update(member: Member): Promise<Member> {
    return this.repo.update(member)
  }

  public delete(userId: number, memberId: number): Promise<void> {
    return this.repo.delete(userId, memberId)
  }
}
