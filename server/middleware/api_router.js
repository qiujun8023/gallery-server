'use strict'

const router = require('koa-router')()

router.get('/api/config', require('../api/config'))
router.all('/api/gallery', require('../api/gallery'))

router.all('/api/*', async function (ctx) {
  ctx.throw(404, '未找到相关 API')
})

module.exports = () => router.routes()
