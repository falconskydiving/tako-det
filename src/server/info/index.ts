import * as Koa from 'koa'
import * as Router from 'koa-router'

export function init(server: Koa) {
  const router = new Router()

  router.get('', ctx => {
    ctx.body = {
      name: 'Membership Portal API',
      version: 1,
      url: '/api/v1',
      example: '/api/v1/levels'
    }
  })

  router.get('/api/v1', ctx => {
    ctx.body = {
      name: 'Main API End Point',
      version: 1,
      example: '/api/v1/levels'
    }
  })

  server.use(router.routes())
}
