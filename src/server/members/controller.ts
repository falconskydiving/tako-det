import { Context } from 'koa'
import { Member } from '../../entities'
import { AuthUser } from '../../lib/authentication'
import { MemberManager } from '../../managers'
import { MemberModel } from './model'

export class MemberController {
  private manager: MemberManager

  constructor(manager: MemberManager) {
    this.manager = manager
  }

  public async get(ctx: Context) {
    const authUser: AuthUser = ctx.state.user
    const member = await this.manager.find(authUser.id, ctx.params.id)

    ctx.body = new MemberModel(member)
    ctx.status = 200
  }

  public async getAll(ctx: Context) {
    const authUser: AuthUser = ctx.state.user
    // const limit = isNaN(ctx.query.limit) ? 10 : parseInt(ctx.query.limit, 10)
    // const offset = isNaN(ctx.query.offset) ? 0 : parseInt(ctx.query.offset, 10)
    const members = await this.manager.findUserMembers(authUser.id)

    ctx.body = members.map((t: Member) => new MemberModel(t))
    ctx.status = 200
  }

  public async create(ctx: Context) {
    const member: Member = ctx.request.body
    const newMember = await this.manager.create(member)

    ctx.body = new MemberModel(newMember)
    ctx.status = 201
    ctx.set('location', `/api/v1/members/${newMember.id}`)
  }

  public async update(ctx: Context) {
    const memberDto = ctx.request.body
    const authUser: AuthUser = ctx.state.user
    const member = await this.manager.find(authUser.id, ctx.params.id)

    member.membershipId = memberDto.membershipId
    member.userId = memberDto.userId

    const updatedMember = await this.manager.update(member)

    ctx.body = new MemberModel(updatedMember)
    ctx.status = 200
  }

  public async delete(ctx: Context) {
    const authUser: AuthUser = ctx.state.user
    const id: number = ctx.params.id

    await this.manager.delete(authUser.id, id)

    ctx.status = 204
  }
}
