import { Membership } from '../entities'
import { NotFoundError } from '../errors'
import { MySql } from '../lib/database'

export class MembershipRepository {
  private readonly TABLE: string = 'membership'
  private db: MySql

  constructor(db: MySql) {
    this.db = db
  }

  public async find(userId: number, id: number): Promise<Membership> {
    const conn = await this.db.getConnection()
    const row = await conn
      .select()
      .from(this.TABLE)
      .where({ id, user_id: userId })
      .first()

    if (!row) {
      throw new NotFoundError('Membership does not exist')
    }

    return this.transform(row)
  }

  public async findByUser(userId: number, offset: number): Promise<Membership> {
    const conn = await this.db.getConnection()
    const row = await conn
      .select()
      .from(this.TABLE)
      .where({ user_id: userId })
      .orderBy('updated', 'DESC')
      .offset(offset)
      // .limit(limit)
      .first()

    return this.transform(row)
  }

  public async insert(membership: Membership): Promise<Membership> {
    membership.created = new Date()
    membership.updated = new Date()

    const conn = await this.db.getConnection()
    const result = await conn.table(this.TABLE).insert({
      level_id: membership.levelId,
      active: membership.active,
      created: membership.created,
      updated: membership.updated,
      user_id: membership.userId
    })

    membership.id = result[0]

    return membership
  }

  public async update(membership: Membership): Promise<Membership> {
    membership.updated = new Date()

    const conn = await this.db.getConnection()

    await conn
      .table(this.TABLE)
      .update({
        level_id: membership.levelId,
        active: membership.active,
        statistics: JSON.stringify(membership.statistics)
      })
      .where({ user_id: membership.userId, id: membership.id })

    return membership
  }

  public async delete(userId: number): Promise<void> {
    const conn = await this.db.getConnection()

    const result = await conn
      .from(this.TABLE)
      .delete()
      .where({ user_id: userId })

    if (result === 0) {
      // throw new NotFoundError('Membership does not exist')
      console.log('Membership does not exist - debug')
    }
  }

  private transform(row: any): Membership {
    return {
      id: row.id,
      levelId: row.level_id,
      active: row.active,
      userId: row.user_id,
      statistics: JSON.parse(row.statistics),
      created: row.created,
      updated: row.updated
    }
  }
}
