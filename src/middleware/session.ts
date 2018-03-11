import session from 'koa-generic-session'
import redisStore from 'koa-redis'

import redis from '../lib/redis'

let options = {
  store: redisStore({
    client: redis
  }),
  key: 'SESSION',
  prefix: 'session:'
}

export default () => session(options)
