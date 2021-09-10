import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { removeTag, setTag } from './helper'

export function init(server: Koa) {
  const router = new Router({ prefix: '/api/v1/webhooks' })
  router.post('/addTag', bodyParser(), async ctx => {
    ctx.body = await setTag(ctx.req, ctx.res)
  })

  router.post('/removeTag', bodyParser(), async ctx => {
    ctx.body = await removeTag(ctx.req, ctx.res)
  })

  server.use(router.routes())
}
