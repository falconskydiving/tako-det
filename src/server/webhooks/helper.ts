import { Membership, User } from '../../entities'
import { ShopifyAPI } from '../../lib/shopify'
import { LevelManager, MembershipManager } from '../../managers'
import { LevelModel } from '../levels/model'
import { UserModel } from '../users/model'
import { rechargeTransform } from './transform'

import { database } from '../../../test/integration/database-utils'
import { BCryptHasher } from '../../lib/hasher'
import { MembershipRepository } from '../../repositories'
import { LevelRepository, UserRepository } from '../../repositories'

const _ = require('lodash')
require('request')
const request = require('request-promise')

const SUBSCRIPTION = 'subscription'

export const rc = {
  // ReCharge API Token
  rechargeApiToken: process.env.RECHARGE_API_TOKEN,
  // Shopify API Tokens
  ShopifyApiUsername: process.env.SHOPIFY_API_USER,
  ShopifyApiPassword: process.env.SHOPIFY_API_PASSWORD,
  ShopifyApiShop: process.env.STORE_NAME,
  ShopifyApiVersion: process.env.SHOPIFY_API_VERSION,
  ShopifyCustomerID: null,
  tagName: null,

  buildShopifyURL(resource: any) {
    return `https://${rc.ShopifyApiUsername}:${rc.ShopifyApiPassword}@${rc.ShopifyApiShop}.myShopify.com/admin/api/${rc.ShopifyApiVersion}/${resource}`
  },

  async getReChargeCustomer(customerID: number) {
    return request({
      method: 'GET',
      uri: `https://api.rechargeapps.com/customers/${customerID}`,
      headers: {
        'X-ReCharge-Access-Token': rc.rechargeApiToken
      }
    })
  },

  async getShopifyCustomer(rcCustomer: string) {
    rc.ShopifyCustomerID = JSON.parse(rcCustomer).customer.shopify_customer_id

    return request({
      method: 'GET',
      uri: rc.buildShopifyURL('customers/' + rc.ShopifyCustomerID + '.json')
    })
  },

  setCustomerTags(ShopifyCustomer: string) {
    const tagsString = JSON.parse(ShopifyCustomer).customer.tags
    const tags = tagsString.split(',').map((item: string) => {
      return item.trim()
    })

    return tags
  },

  hasTag(arr: string | any[], value: string) {
    return arr.indexOf(value) > -1
  },

  async updateShopifyCustomer(tagsArray: any[]) {
    console.log(rc.ShopifyCustomerID)
    return request({
      method: 'PUT',
      uri: rc.buildShopifyURL('customers/' + rc.ShopifyCustomerID + '.json'),
      json: true,
      headers: {
        Accept: '* / *',
        'Content-Type': 'application/json'
      },
      body: {
        customer: {
          tags: tagsArray.toString()
        }
      }
    }).then(response => {
      console.log(response)
      return 'Shopify Customer Updated'
    })
  },
  async processRequestAdd(tags: any) {
    if (rc.hasTag(tags, rc.tagName)) {
      console.log(rc.tagName + ' Tag Already Present')
      console.log(tags)
      return rc.tagName + ' Tag Already Present'
    } else {
      tags.push(rc.tagName)
      console.log(rc.tagName + ' Tag Added')
      console.log(tags)
      return await rc.updateShopifyCustomer(tags)
    }
  },

  processRequestRemove(tags: any) {
    if (rc.hasTag(tags, rc.tagName)) {
      const index = tags.indexOf(rc.tagName)
      if (index > -1) {
        tags.splice(index, 1)
      }
      console.log(rc.tagName + ' Tag Removed')
      return rc.updateShopifyCustomer(tags)
    } else {
      return rc.tagName + ' Tag Not Present'
    }
  }
}
const processTier = (tag: any) => {
  const splitTag = tag.split(':')
  const tier = splitTag[1]
  return tier
}
const getTier = (tags: any) => {
  let subTier: any
  _.each(tags, (tag: string | string[]) => {
    if (tag.indexOf(SUBSCRIPTION) > -1) {
      subTier = processTier(tag)
    }
  })
  return subTier
}

const processTag = (tags: any) => {
  return getTier(tags)
}
export const setTag = async (ctx: any) => {
  console.log(JSON.stringify(ctx.request.body))
  // const reqBody = JSON.parse(req.body)
  const reqBody = ctx.request.body
  const shopifyApi = new ShopifyAPI()
  const customerID = reqBody.subscription.customer_id || null
  const productID = reqBody.subscription.shopify_product_id || null
  const product = await shopifyApi.getProduct(productID)
  const tag = processTag(product.tags.split(','))
  rc.tagName = `subscription:${tag}` || null
  if (customerID && rc.tagName) {
    // Create User if doesn't exist
    const user = await rc.getReChargeCustomer(customerID)
    console.log(user)
    const systemUser = await rechargeTransform(user)
    console.log(systemUser)

    console.log(' --------- sleep begin')
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log(' --------- sleep end')

    const result = await rc
      .getReChargeCustomer(customerID)
      .then(rc.getShopifyCustomer)
      .then(rc.setCustomerTags)
      .then(rc.processRequestAdd)
      .then(async res => {
        if (res === 'Shopify Customer Updated') {
          const userRepo = new UserRepository(database)
          const levelRepo = new LevelRepository(database)
          const levelManager = new LevelManager(levelRepo)
          const level = new LevelModel(await levelManager.findByStub(tag))
          const hasher = new BCryptHasher()
          const hashPassword = await hasher.hashPassword(systemUser.password)
          systemUser.password = hashPassword
          systemUser.availableMonthlyCredit = level.monthlyCredit

          const userRaw = await userRepo.insertAfterSetTag(systemUser as User)
          if (userRaw != null) {
            const createdUser = new UserModel(userRaw)
            console.log(createdUser)
            const memberRepo = new MembershipRepository(database)
            const membershipManager = new MembershipManager(memberRepo)
            const membership = await membershipManager.create({
              userId: createdUser.id,
              levelId: level.id,
              active: true
            } as Membership)
            console.log(membership)
          }
        }
        ctx.status = 200
        return res
      })
    console.log(result)
  } else {
    console.log('CustomerID not found.  Could not process webhook.')
  }
}

export const removeTag = async (ctx: any) => {
  const reqBody = ctx.request.body
  const shopifyApi = new ShopifyAPI()
  const customerID = reqBody.subscription.customer_id || null
  const productID = reqBody.subscription.shopify_product_id || null
  const product = await shopifyApi.getProduct(productID)
  const tag = processTag(product.tags.split(','))

  rc.tagName = `subscription:${tag}` || null
  if (customerID && rc.tagName) {
    console.log(' --------- sleep removeTag begin')
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log(' --------- sleep removeTag end')

    const result = await rc
      .getReChargeCustomer(customerID)
      .then(rc.getShopifyCustomer)
      .then(rc.setCustomerTags)
      .then(rc.processRequestRemove)
      .then(async res => {
        if (res === 'Shopify Customer Updated') {
          const userRepo = new UserRepository(database)
          const userRaw = await userRepo.findByRechargeCustomerId(customerID)

          if (userRaw != null) {
            const user = new UserModel(userRaw)

            const memberRepo = new MembershipRepository(database)
            const membershipManager = new MembershipManager(memberRepo)
            await membershipManager.delete(user.id)
            await userRepo.delete(user.id)
          }
        }
        ctx.status = 200
        return res
      })
    console.log(result)
  } else {
    console.log('CustomerID not found.  Could not process webhook.')
  }
}
export const getAppliedDiscountValue = async (ctx: any) => {
  console.log(' ------------------- order')
  console.log(ctx)
  console.log(ctx.request.body)
  const reqBody = ctx.request.body
  const discountCodes = reqBody.discount_codes
  const totalPrice = Number(reqBody.total_line_items_price)
  console.log('totalPrice => ', totalPrice)
  const userRepo = new UserRepository(database)
  const customerEmail = reqBody.email
  console.log('discountCodes =>', discountCodes)
  if (discountCodes.length > 0) {
    if (discountCodes[0].code === 'DETMEMBERSHIP') {
      const discountAmount = Number(discountCodes[0].amount)
      console.log('discountAmount =>', discountCodes)
      if (discountAmount > 0) {
        console.log('customerEmail =>', customerEmail)
        const user = new UserModel(await userRepo.findByEmail(customerEmail))
        console.log('user =>', user)
        user.availableMonthlyCredit =
          user.availableMonthlyCredit - discountAmount + totalPrice * 0.15
        const updatedUser = await userRepo.update(user as User)
        console.log('updatedUser', updatedUser)
      }
    } else if (discountCodes[0].code === 'MEMBERSHIP') {
      console.log('MEMBERSHIP')
    }
  } else {
    const lineItems = reqBody.line_items
    if (lineItems.length === 1) {
      const product = lineItems[0]
      console.log('product => ', product)
      console.log(process.env.MEMBERSHIP_INSIDER_PRODUCT_ID)
      console.log(process.env.MEMBERSHIP_ELITE_PRODUCT_ID)
      console.log(process.env.MEMBERSHIP_TEAM_PRODUCT_ID)
      const insiderProductId = Number(process.env.MEMBERSHIP_INSIDER_PRODUCT_ID)
      const eliteProductId = Number(process.env.MEMBERSHIP_ELITE_PRODUCT_ID)
      const teamProductId = Number(process.env.MEMBERSHIP_TEAM_PRODUCT_ID)
      if (
        product.product_id === insiderProductId ||
        product.product_id === eliteProductId ||
        product.product_id === teamProductId
      ) {
        // || product.product_id === process.env.MEMBERSHIP_ELITE_PRODUCT_ID || product.product_id === process.env.MEMBERSHIP_TEAM_PRODUCT_ID) {
        console.log('customerEmail =>', customerEmail)
        const checkoutToken = reqBody.checkout_token
        console.log('checkout_token => ', checkoutToken)
        if (checkoutToken == null) {
          const user = new UserModel(await userRepo.findByEmail(customerEmail))
          console.log('user =>', user)
          user.availableMonthlyCredit += Number(product.price)
          const updatedUser = await userRepo.update(user as User)
          console.log('updatedUser', updatedUser)
        } else {
          const userRaw = await userRepo.findByEmailForLatterSubscription(
            customerEmail
          )
          console.log(' -------- userRaw =>', userRaw)
          if (userRaw != null) {
            const user = new UserModel(userRaw)
            console.log(' -------- user - latter subscription =>', user)

            const customerID = userRaw.rechargeId

            console.log(' --------- sleep  - latter subscription begin')
            await new Promise(resolve => setTimeout(resolve, 3000))
            console.log(' --------- sleep  - latter subscription end')
            const userRecharge = await rc.getReChargeCustomer(customerID)
            console.log(userRecharge)
            if (
              JSON.parse(userRecharge).customer.number_active_subscriptions > 1
            ) {
              user.availableMonthlyCredit += Number(product.price)
              const updatedUser = await userRepo.update(user as User)

              console.log('updatedUser - latter subscription', updatedUser)
            }
          }
        }
      }
    }
  }
}
