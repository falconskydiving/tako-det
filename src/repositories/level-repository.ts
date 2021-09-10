import { Level } from '../entities'
import { NotFoundError } from '../errors'
import { MySql } from '../lib/database'

export class LevelRepository {
  private readonly TABLE: string = 'level'
  private db: MySql

  constructor(db: MySql) {
    this.db = db
  }

  public async find(id: number): Promise<Level> {
    const conn = await this.db.getConnection()
    const row = await conn
      .select()
      .from(this.TABLE)
      .where({ id })
      .first()

    if (!row) {
      throw new NotFoundError('Level does not exist')
    }

    return this.transform(row)
  }

  public async findByStub(stub: string): Promise<Level> {
    const conn = await this.db.getConnection()
    const row = await conn
      .select()
      .from(this.TABLE)
      .where({ stub })
      .first()

    if (!row) {
      throw new NotFoundError('Level does not exist')
    }

    return this.transform(row)
  }

  public async findAll(limit: number, offset: number): Promise<Level[]> {
    const conn = await this.db.getConnection()
    const results = await conn
      .select()
      .from(this.TABLE)
      .orderBy('updated', 'DESC')
      .offset(offset)
      .limit(limit)

    return results.map((r: any) => this.transform(r))
  }

  public async insert(level: Level): Promise<Level> {
    level.created = new Date()
    level.updated = new Date()

    const conn = await this.db.getConnection()
    const result = await conn.table(this.TABLE).insert({
      name: level.name,
      number_of_users: level.numberOfUsers,
      monthly_price: level.monthlyPrice,
      annual_price: level.annualPrice,
      monthly_credit: level.monthlyCredit,
      discount: level.discount,
      professional_development_certificates:
        level.professionalDevelopmentCertificates,
      detalk: level.detalk,
      referral_credit: level.referralCredit,
      other_perks: level.otherPerks,
      created: level.created,
      updated: level.updated
    })

    level.id = result[0]

    return level
  }

  public async update(level: Level): Promise<Level> {
    level.updated = new Date()

    const conn = await this.db.getConnection()

    await conn
      .table(this.TABLE)
      .update({
        name: level.name,
        number_of_users: level.numberOfUsers,
        monthly_price: level.monthlyPrice,
        annual_price: level.annualPrice,
        monthly_credit: level.monthlyCredit,
        discount: level.discount,
        professional_development_certificates:
          level.professionalDevelopmentCertificates,
        detalk: level.detalk,
        referral_credit: level.referralCredit,
        other_perks: level.otherPerks
      })
      .where({ id: level.id })

    return level
  }

  public async delete(userId: number, levelId: number): Promise<void> {
    const conn = await this.db.getConnection()

    const result = await conn
      .from(this.TABLE)
      .delete()
      .where({ id: levelId, user_id: userId })

    if (result === 0) {
      throw new NotFoundError('Level does not exist')
    }
  }

  private transform(row: any): Level {
    return {
      id: row.id,
      name: row.name,
      stub: row.stub,
      numberOfUsers: row.number_of_users,
      monthlyPrice: row.monthly_price,
      annualPrice: row.annual_price,
      monthlyCredit: row.monthly_credit,
      discount: row.discount,
      professionalDevelopmentCertificates:
        row.professional_development_certificates,
      detalk: row.detalk,
      referralCredit: row.referral_credit,
      otherPerks: row.other_perks,
      created: row.created,
      updated: row.updated
    }
  }
}
