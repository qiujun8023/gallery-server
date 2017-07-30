'use strict'

const _ = require('lodash')
const router = require('koa-router')()
const service = require('../service')
const album = require('../views/album')

router.get('/', async function (ctx) {
  ctx.redirect('/album')
})

router.all('/album/:path*', async function (ctx) {
  let path = '/' + (ctx.params.path || '')
  let data = await service.getAlbumAsync(path)
  ctx.body = album({
    name: data.name,
    description: data.description,
    data: JSON.stringify(data.data),
    navbar: service.getNavbarInfo(path)
  })
})

module.exports = () => router.routes()
