'use strict'

const session = require('koa-generic-session')
const convert = require('koa-convert')
const RedisStore = require('koa-redis')
const redis = require('../lib/redis')

let options = {
  store: new RedisStore({
    client: redis
  }),
  key: 'news.sess',
  prefix: 'session:'
}

module.exports = () => convert(session(options))
