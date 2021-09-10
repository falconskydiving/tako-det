import { RechargeCustomer } from '../../lib/recharge'
import { CreateUser } from '../users/model'

export const rechargeTransform = async (user: RechargeCustomer) => {
  const password = 'secret'
  const shopifyUser: CreateUser = {
    firstName: user.first_name,
    lastName: user.last_name,
    shopifyId: user.shopify_customer_id,
    rechargeId: user.id,
    email: user.email,
    password
  }
  return shopifyUser
}
