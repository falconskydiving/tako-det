import { Member } from '../entities'
import { NotFoundError } from '../errors'
import { MySql } from '../lib/database'

export class MemberRepository {
  private readonly TABLE: string = 'member'
  private db: MySql

  constructor(db: MySql) {
    this.db = db
  }

  public async find(userId: number, id: number): Promise<Member> {
    const conn = await this.db.getConnection()
    const row = await conn
      .select()
      .from(this.TABLE)
      .where({ id, user_id: userId })
      .first()

    if (!row) {
      throw new NotFoundError('Member does not exist')
    }

    return this.transform(row)
  }

  public async findByUser(
    userId: number,
    limit: number,
    offset: number
  ): Promise<Member[]> {
    const conn = await this.db.getConnection()
    const results = await conn
      .select()
      .from(this.TABLE)
      .where({ user_id: userId })
      .orderBy('updated', 'DESC')
      .offset(offset)
      .limit(limit)

    return results.map((r: any) => this.transform(r))
  }

  public async findByMembership(
    membershipId: number,
    limit: number,
    offset: number
  ): Promise<Member[]> {
    const conn = await this.db.getConnection()
    const results = await conn
      .select()
      .from(this.TABLE)
      .where({ membership_id: membershipId })
      .orderBy('updated', 'DESC')
      .offset(offset)
      .limit(limit)

    return results.map((r: any) => this.transform(r))
  }

  public async insert(member: Member): Promise<Member> {
    member.created = new Date()
    member.updated = new Date()

    const conn = await this.db.getConnection()
    const result = await conn.table(this.TABLE).insert({
      user_id: member.userId,
      membership_id: member.membershipId,
      created: member.created,
      updated: member.updated
    })

    member.id = result[0]

    return member
  }

  public async update(member: Member): Promise<Member> {
    member.updated = new Date()

    const conn = await this.db.getConnection()

    await conn
      .table(this.TABLE)
      .update({
        user_id: member.userId,
        membership_id: member.membershipId
      })
      .where({ user_id: member.userId, id: member.id })

    return member
  }

  public async delete(userId: number, memberId: number): Promise<void> {
    const conn = await this.db.getConnection()

    const result = await conn
      .from(this.TABLE)
      .delete()
      .where({ id: memberId, user_id: userId })

    if (result === 0) {
      throw new NotFoundError('Member does not exist')
    }
  }

  private transform(row: any): Member {
    return {
      id: row.id,
      membershipId: row.membership_id,
      userId: row.user_id,
      created: row.created,
      updated: row.updated
    }
  }
}
