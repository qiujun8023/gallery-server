'use strict'

const session = require('koa-generic-session')
const RedisStore = require('koa-redis')
const redis = require('../lib/redis')

let options = {
  store: new RedisStore({
    client: redis
  }),
  key: 'news.sess',
  prefix: 'session:'
}

module.exports = () => session(options)
