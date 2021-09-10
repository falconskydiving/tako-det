import * as Koa from 'koa'
// import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { OrderController } from './controller'

export function init(server: Koa) {
  const router = new Router({ prefix: '/api/v1/orders' })
  const controller = new OrderController()
  router.get('/:id', controller.getOrders.bind(controller))

  server.use(router.routes())
}
