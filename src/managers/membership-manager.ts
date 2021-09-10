import { Membership } from '../entities'
import { MembershipRepository } from '../repositories'

export class MembershipManager {
  private repo: MembershipRepository

  constructor(repo: MembershipRepository) {
    this.repo = repo
  }

  public find(userId: number, id: number): Promise<Membership> {
    return this.repo.find(userId, id)
  }

  public async findUserMemberships(
    userId: number,
    limit?: number,
    offset?: number
  ): Promise<Membership> {
    return this.repo.findByUser(userId, limit, offset)
  }

  public create(membership: Membership): Promise<Membership> {
    return this.repo.insert(membership)
  }

  public update(membership: Membership): Promise<Membership> {
    return this.repo.update(membership)
  }

  public delete(userId: number): Promise<void> {
    return this.repo.delete(userId)
  }
}
