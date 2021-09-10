import { Customer } from '../lib/shopify'

export interface User {
  id?: number
  email: string
  password: string
  role: string
  firstName: string
  lastName: string
  shopifyId: number
  rechargeId?: number
  shopify?: Customer
  recharge?: any
  membership?: any
  level?: any
  created: Date
  updated: Date
}
