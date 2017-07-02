'use strict'

const router = require('koa-router')()
const service = require('../service')
const empty = require('../views/empty')
const gallery = require('../views/gallery')

router.all('/:path*', async function (ctx) {
  let path = '/' + (ctx.params.path || '')
  let data = await service.getGalleryAsync(path)
  ctx.body = data //gallery(data)
})

module.exports = () => router.routes()
