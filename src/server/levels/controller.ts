import { Context } from 'koa'
import { Level } from '../../entities'
import { AuthUser } from '../../lib/authentication'
import { LevelManager } from '../../managers'
import { LevelModel } from './model'

export class LevelController {
  private manager: LevelManager

  constructor(manager: LevelManager) {
    this.manager = manager
  }

  public async get(ctx: Context) {
    const level = await this.manager.find(ctx.params.id)

    ctx.body = new LevelModel(level)
    ctx.status = 200
  }

  public async getAll(ctx: Context) {
    // const limit = isNaN(ctx.query.limit) ? 10 : parseInt(ctx.query.limit, 10)
    // const offset = isNaN(ctx.query.offset) ? 0 : parseInt(ctx.query.offset, 10)
    const levels = await this.manager.findAll()

    ctx.body = levels.map((t: Level) => new LevelModel(t))
    ctx.status = 200
  }

  public async create(ctx: Context) {
    const level: Level = ctx.request.body
    const newLevel = await this.manager.create(level)

    ctx.body = new LevelModel(newLevel)
    ctx.status = 201
    ctx.set('location', `/api/v1/levels/${newLevel.id}`)
  }

  public async update(ctx: Context) {
    const levelDto = ctx.request.body
    const level = await this.manager.find(ctx.params.id)

    level.name = levelDto.name
    level.stub = levelDto.stub
    level.numberOfUsers = levelDto.numberOfUsers
    level.monthlyPrice = levelDto.monthlyPrice
    level.annualPrice = levelDto.annualPrice
    level.monthlyCredit = levelDto.monthlyCredit
    level.discount = levelDto.discount
    level.professionalDevelopmentCertificates =
      levelDto.professionalDevelopmentCertificates
    level.detalk = levelDto.detalk
    level.referralCredit = levelDto.referralCredit
    level.otherPerks = levelDto.otherPerks

    const updatedLevel = await this.manager.update(level)

    ctx.body = new LevelModel(updatedLevel)
    ctx.status = 200
  }

  public async delete(ctx: Context) {
    const authUser: AuthUser = ctx.state.user
    const id: number = ctx.params.id

    await this.manager.delete(authUser.id, id)

    ctx.status = 204
  }
}
