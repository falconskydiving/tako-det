import { User } from '../../entities'

export interface CreateUser {
  email: string
  password: string
  firstName: string
  lastName: string
  shopifyId: number
  rechargeId: number
  level?: string
}

export class UserModel {
  public id: number
  public email: string
  public firstName: string
  public lastName: string
  public shopifyId: number
  public shopify: object
  public level?: object
  public membership?: object
  public created: Date
  public updated: Date

  constructor(user: User) {
    this.id = user.id
    this.email = user.email
    this.firstName = user.firstName
    this.lastName = user.lastName
    this.shopifyId = user.shopifyId
    this.level = user.level
    this.membership = user.membership
    this.shopify = user.shopify
    this.created = user.created
    this.updated = user.updated
  }
}
