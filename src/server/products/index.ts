import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { ServiceContainer } from '../../container'
import { Role } from '../../lib/authentication'
import { ShopifyAPI } from '../../lib/shopify'
import * as middleware from '../middlewares'

export function init(server: Koa, container: ServiceContainer) {
  const router = new Router({ prefix: '/api/v1/products' })
  const shopifyApi = new ShopifyAPI()
  router.get(
    '/:id',
    middleware.authentication(container.lib.authenticator),
    middleware.authorization([Role.user, Role.admin]),
    async ctx => {
      ctx.body = await shopifyApi.getProduct(ctx.params.id)
    }
  )

  router.get(
    '/',
    // middleware.authentication(container.lib.authenticator),
    // middleware.authorization([Role.user, Role.admin]),
    async ctx => {
      const collectionId = ctx.request.query.collection_id || ''
      if (collectionId !== '') {
        ctx.body = await shopifyApi.getProductsByCollectionId(collectionId)
      } else {
        const productId = ctx.request.query.product_id_metafields || ''
        if (productId !== '') {
          ctx.body = await shopifyApi.getProductMetafields(productId)
        } else {
          ctx.body = await shopifyApi.getProducts()
        }
      }
    }
  )

  router.put(
    '/',
    bodyParser(),
    middleware.authentication(container.lib.authenticator),
    middleware.authorization([Role.user, Role.admin]),
    async ctx => {
      ctx.body = await shopifyApi.updateProduct(ctx.request.body)
    }
  )
  server.use(router.routes())
}
