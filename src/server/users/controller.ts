import { Context } from 'koa'
import { Membership, User } from '../../entities'
import { AuthUser } from '../../lib/authentication'
import { ShopifyAPI } from '../../lib/shopify'
import { LevelManager, MembershipManager, UserManager } from '../../managers'
import { LevelModel } from '../levels/model'
import { MembershipModel } from '../memberships/model'
// import { rc } from '../webhooks/helper'
import { CreateUser, UserModel } from './model'

export class UserController {
  private manager: UserManager
  private shopifyApi: ShopifyAPI
  private membershipManager: MembershipManager
  private levelManager: LevelManager

  constructor(
    manager: UserManager,
    levelManager: LevelManager,
    membershipManager: MembershipManager
  ) {
    this.manager = manager
    this.shopifyApi = new ShopifyAPI()
    this.levelManager = levelManager
    this.membershipManager = membershipManager
  }

  public async create(ctx: Context) {
    const userDto: CreateUser = ctx.request.body
    const newUser = await this.manager.create(userDto as User)

    const level = await this.levelManager.findByStub(userDto.level)
    const membership = await this.membershipManager.create({
      userId: newUser.id,
      levelId: level.id,
      active: true
    } as Membership)

    newUser.level = level
    newUser.membership = membership

    ctx.body = new UserModel(newUser)
    ctx.status = 201
    ctx.set('location', '/api/v1/users/me')
  }

  public async login(ctx: Context) {
    const { accessToken, user } = await this.manager.login(
      ctx.request.body.email,
      ctx.request.body.password
    )
    ctx.body = {
      accessToken,
      user
    }
  }

  public async update(ctx: Context) {
    const userDto = ctx.request.body

    // const user = await this.manager.findByEmail(ctx.state.user.email)
    const user = await this.manager.findByEmail(userDto.email)
    // return
    const level = await this.levelManager.findByStub(userDto.level.stub)
    const membership = new MembershipModel(
      await this.membershipManager.findUserMemberships(user.id)
    )
    membership.userId = user.id
    membership.levelId = level.id
    membership.statistics = userDto.membership.statistics
    membership.active = true
    const updatedMembership = await this.membershipManager.update(
      membership as Membership
    )
    user.firstName = userDto.firstName
    user.lastName = userDto.lastName
    user.shopifyId = Number(userDto.shopifyId)
    user.availableMonthlyCredit = Number(userDto.availableMonthlyCredit)
    user.shopify = userDto.shopify
    user.level = level
    user.membership = updatedMembership
    const updatedUser = await this.manager.update(user)
    const updatedShopifyUser = await this.shopifyApi.updateCustomer(
      user.shopifyId,
      user.shopify
    )
    updatedUser.shopify = updatedShopifyUser

    ctx.body = new UserModel(updatedUser)
    ctx.status = 200
  }

  public async changePassword(ctx: Context) {
    const newPassword = ctx.request.body.newPassword
    const oldPassword = ctx.request.body.oldPassword

    await this.manager.changePassword(
      ctx.state.user.email,
      newPassword,
      oldPassword
    )

    ctx.status = 204
  }

  public async get(ctx: Context) {
    const authUser: AuthUser = ctx.state.user
    const user = await this.manager.findByEmail(authUser.email)

    user.shopify = await this.shopifyApi.getCustomer(user.shopifyId)
    ctx.body = new UserModel(user)
    ctx.status = 200
  }

  public async getAll() {
    // const authUser: AuthUser = ctx.state.user
    const users = await this.manager.findAll()
    return users
  }

  public async getUser(ctx: Context) {
    const user = await this.manager.findByShopifyId(ctx.params.id)
    const membership = await this.membershipManager.findUserMemberships(user.id)

    const level = new LevelModel(
      await this.levelManager.find(membership.levelId)
    )
    user.shopify = await this.shopifyApi.getCustomer(user.shopifyId)
    user.membership = membership
    user.level = level
    // user.recharge = await rc.getReChargeCustomer(user.rechargeId)
    ctx.body = new UserModel(user)
    ctx.status = 200
  }
  public async delete(ctx: Context) {
    await this.manager.delete(ctx.params.id)

    ctx.status = 204
  }
  public async updateDiscountPrice(customerId, totalPrice) {
    const discountCode = await this.shopifyApi.getDiscountCode()
    console.log('discountCode => ', discountCode)
    const priceRuleId = discountCode.price_rule_id
    console.log('priceRuleId => ', priceRuleId)
    // const priceRule = await this.shopifyApi.getPriceRule(priceRuleId)
    const user = await this.manager.findByShopifyId(customerId)
    console.log('user => ', user)
    const availableMonthlyCredit =
      user.availableMonthlyCredit + (totalPrice * 0.15) / 100
    console.log(availableMonthlyCredit)
    await this.shopifyApi.updatePriceRule(
      priceRuleId,
      availableMonthlyCredit * -1
    )
    return availableMonthlyCredit
  }
}
