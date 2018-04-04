import koaSession from 'koa-generic-session'
import redisStore from 'koa-redis'
import { Context } from 'koa' // tslint:disable-line

import redis from '../lib/redis'

let options = {
  store: redisStore({
    client: redis
  }),
  key: 'SESSION',
  prefix: 'session:'
}

export default () => koaSession(options)
