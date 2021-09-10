import { Context } from 'koa'
import { ShopifyAPI } from '../../lib/shopify'

export class OrderController {
  private shopifyApi: ShopifyAPI
  constructor() {
    this.shopifyApi = new ShopifyAPI()
  }
  public async getOrders(ctx: Context) {
    const customerId = ctx.params.id
    console.log('customerId')
    console.log(customerId)
    const orders = await this.shopifyApi.getOrders(customerId)
    ctx.body = orders
    ctx.status = 200
  }
}
