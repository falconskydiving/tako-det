import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { getAppliedDiscountValue, removeTag, setTag } from './helper'

export function init(server: Koa) {
  const router = new Router({ prefix: '/api/v1/webhooks' })
  router.post('/addTag', bodyParser(), async ctx => {
    console.log(JSON.stringify(ctx))
    await setTag(ctx)
  })

  router.post('/removeTag', bodyParser(), async ctx => {
    await removeTag(ctx)
  })

  router.post('/getAppliedDiscountValue', bodyParser(), async ctx => {
    await getAppliedDiscountValue(ctx)
    ctx.status = 200
  })

  server.use(router.routes())
}
