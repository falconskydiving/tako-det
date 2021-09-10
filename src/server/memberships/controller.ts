import { Context } from 'koa'
import { Membership } from '../../entities'
import { AuthUser } from '../../lib/authentication'
import { MembershipManager } from '../../managers'
import { MembershipModel } from './model'

export class MembershipController {
  private manager: MembershipManager

  constructor(manager: MembershipManager) {
    this.manager = manager
  }

  public async get(ctx: Context) {
    const authUser: AuthUser = ctx.state.user
    const membership = await this.manager.find(authUser.id, ctx.params.id)

    ctx.body = new MembershipModel(membership)
    ctx.status = 200
  }

  public async getAll(ctx: Context) {
    const authUser: AuthUser = ctx.state.user
    // const limit = isNaN(ctx.query.limit) ? 10 : parseInt(ctx.query.limit, 10)
    // const offset = isNaN(ctx.query.offset) ? 0 : parseInt(ctx.query.offset, 10)
    const memberships = await this.manager.findUserMemberships(authUser.id)
    ctx.body = new MembershipModel(memberships)
    // ctx.body = memberships.map((t: Membership) => new MembershipModel(t))
    ctx.status = 200
  }

  public async create(ctx: Context) {
    const membership: Membership = ctx.request.body

    membership.active = true
    const newMembership = await this.manager.create(membership)

    ctx.body = new MembershipModel(newMembership)
    ctx.status = 201
    ctx.set('location', `/api/v1/memberships/${newMembership.id}`)
  }

  public async update(ctx: Context) {
    const membershipDto = ctx.request.body
    const authUser: AuthUser = ctx.state.user
    const membership = await this.manager.find(authUser.id, ctx.params.id)

    membership.levelId = membershipDto.levelId
    membership.active = membershipDto.active

    const updatedMembership = await this.manager.update(membership)

    ctx.body = new MembershipModel(updatedMembership)
    ctx.status = 200
  }

  public async delete(ctx: Context) {
    // const authUser: AuthUser = ctx.state.user
    const id: number = ctx.params.id

    await this.manager.delete(id)

    ctx.status = 204
  }
}
