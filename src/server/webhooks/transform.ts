// import { RechargeCustomer } from '../../lib/recharge'
import { CreateUser } from '../users/model'

export const rechargeTransform = async (user: any) => {
  const password = 'secret'
  console.log(JSON.parse(user))
  const shopifyUser: CreateUser = {
    firstName: JSON.parse(user).customer.first_name,
    lastName: JSON.parse(user).customer.last_name,
    shopifyId: JSON.parse(user).customer.shopify_customer_id,
    rechargeId: JSON.parse(user).customer.id,
    availableMonthlyCredit: 14.99,
    email: JSON.parse(user).customer.email,
    password
  }
  return shopifyUser
}
