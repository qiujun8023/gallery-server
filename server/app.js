'use strict'

const config = require('config')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const send = require('koa-send')
const client = require('koa-static')
const error = require('koa-json-error')
const logger = require('./lib/logger')
const session = require('./middleware/session')
const apiRouter = require('./middleware/api_router')

const app = new Koa()

app.keys = config.keys

// 错误处理
app.use(error())

// Body Parser
app.use(bodyParser())

// Session 加载
app.use(session())

// Api 路由
app.use(apiRouter())

// 前端目录
app.use(client(config.clientDir))

// 默认发送前端首页文件
app.use(async (ctx) => {
  let opt = {root: config.clientDir}
  await send(ctx, 'index.html', opt)
})

// 监听服务
app.listen(config.port, config.host)
logger.info('Server listen on ' + config.baseUrl)
