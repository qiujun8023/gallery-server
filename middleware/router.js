'use strict'

const router = require('koa-router')()
const service = require('../service')
const gallery = require('../views/gallery')

router.get('/', async function (ctx) {
  ctx.redirect('/gallery')
})

router.all('/gallery/:path*', async function (ctx) {
  let path = '/' + (ctx.params.path || '')
  let data = await service.getGalleryAsync(path)
  ctx.body = gallery(data)
})

module.exports = () => router.routes()
