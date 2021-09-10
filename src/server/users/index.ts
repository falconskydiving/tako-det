import * as Joi from 'joi'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { ServiceContainer } from '../../container'
import { Role } from '../../lib/authentication'
import * as middleware from '../middlewares'
import { UserController } from './controller'
import * as validators from './validators'

export function init(server: Koa, container: ServiceContainer) {
  const router = new Router({ prefix: '/api/v1/users' })
  const controller = new UserController(
    container.managers.user,
    container.managers.level,
    container.managers.membership
  )

  router.get(
    '/me',
    middleware.authentication(container.lib.authenticator),
    middleware.authorization([Role.user, Role.admin]),
    controller.get.bind(controller)
  )

  router.get('/:id', controller.getUser.bind(controller))
  // router.get('/', bodyParser(), controller.getAll.bind(controller))
  router.get('/', bodyParser(), async ctx => {
    const customerId = ctx.request.query.customer_id_discount || ''
    if (customerId !== '') {
      const totalPrice = ctx.request.query.total_price
      ctx.body = await controller.updateDiscountPrice(customerId, totalPrice)
      ctx.status = 200
    } else {
      ctx.body = await controller.getAll()
      ctx.status = 200
    }
  })
  router.post(
    '/',
    bodyParser(),
    middleware.validate({ request: { body: validators.createUser } }),
    controller.create.bind(controller)
  )

  router.post(
    '/login',
    bodyParser(),
    middleware.validate({ request: { body: validators.login } }),
    controller.login.bind(controller)
  )

  router.put(
    '/',
    bodyParser(),
    // middleware.authentication(container.lib.authenticator),
    // middleware.authorization([Role.user, Role.admin]),
    // middleware.validate({ request: { body: validators.updateUser } }),
    controller.update.bind(controller)
  )

  router.put(
    '/password',
    bodyParser(),
    // middleware.authentication(container.lib.authenticator),
    // middleware.authorization([Role.user, Role.admin]),
    middleware.validate({
      request: {
        body: validators.changePassword
      }
    }),
    controller.changePassword.bind(controller)
  )

  router.delete(
    '/:id',
    middleware.authentication(container.lib.authenticator),
    middleware.authorization([Role.admin]),
    middleware.validate({
      params: { id: Joi.number().required() }
    }),
    controller.delete.bind(controller)
  )

  server.use(router.routes())
}
