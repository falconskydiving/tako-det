import { Membership, User } from '../../entities'
import { ShopifyAPI } from '../../lib/shopify'
import { LevelManager, MembershipManager, UserManager } from '../../managers'
import { LevelModel } from '../levels/model'
import { UserModel } from '../users/model'
import { rechargeTransform } from './transform'
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
    return `https://' ${rc.ShopifyApiUsername}:${rc.ShopifyApiPassword}@${rc.ShopifyApiShop}.myShopify.com/admin/api/${rc.ShopifyApiVersion}/${resource}`
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

  updateShopifyCustomer(tagsArray: any[]) {
    return request({
      method: 'PUT',
      uri: rc.buildShopifyURL('customers/' + rc.ShopifyCustomerID + '.json'),
      json: true,
      body: {
        customer: {
          tags: tagsArray.join()
        }
      }
    }).then(() => {
      return 'Shopify Customer Updated'
    })
  },

  processRequestAdd(tags: any) {
    if (rc.hasTag(tags, rc.tagName)) {
      return rc.tagName + ' Tag Already Present'
    } else {
      tags.push(rc.tagName)
      console.log(rc.tagName + ' Tag Added')
      return rc.updateShopifyCustomer(tags)
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
export const setTag = async (req: any, res: any) => {
  const shopifyApi = new ShopifyAPI()  
  console.log(req.body)
  const customerID = req.body.subscription.customer_id || null
  const productID = req.body.subscription.shopify_product_id || null
  const product = await shopifyApi.getProduct(productID)
  const tag = processTag(product.tags)
  rc.tagName = `subscription:${tag}` || null
  if (customerID && rc.tagName) {
    // Create User if doesn't exist
    const user = await rc.getReChargeCustomer(customerID)
    const systemUser = await rechargeTransform(user)
    // tslint:disable-next-line: prefer-const
    let manager: UserManager
    // tslint:disable-next-line: prefer-const
    let levelManager: LevelManager
    // tslint:disable-next-line: prefer-const
    let membershipManager: MembershipManager

    const result = rc
      .getReChargeCustomer(customerID)
      .then(rc.getShopifyCustomer)
      .then(rc.setCustomerTags)
      .then(rc.processRequestAdd)

    const createdUser = new UserModel(await manager.create(systemUser as User))
    const level = new LevelModel(await levelManager.findByStub(tag))
    await membershipManager.create({
      userId: createdUser.id,
      levelId: level.id,
      active: true
    } as Membership)

    console.log(result)
  } else {
    console.log('CustomerID not found.  Could not process webhook.')
  }
  res.status(200).send('Webhook Received')
}

export const removeTag = async (req: any, res: any) => {
  const shopifyApi = new ShopifyAPI()
  const customerID = req.body.subscription.customer_id || null
  const productID = req.body.subscription.shopify_product_id || null
  const product = await shopifyApi.getProduct(productID)
  const tag = processTag(product.tags)

  // tslint:disable-next-line: prefer-const
  let manager: UserManager
  // tslint:disable-next-line: prefer-const
  let membershipManager: MembershipManager

  rc.tagName = `subscription:${tag}` || null
  if (customerID && rc.tagName) {
    const result = rc
      .getReChargeCustomer(customerID)
      .then(rc.getShopifyCustomer)
      .then(rc.setCustomerTags)
      .then(rc.processRequestRemove)

    const user = new UserModel(await manager.findByShopifyId(customerID))
    await membershipManager.delete(user.id)

    console.log(result)
  } else {
    console.log('CustomerID not found.  Could not process webhook.')
  }
  res.status(200).send('Webhook Received')
}
