'use strict'

const service = require('../service')

module.exports = async function (ctx) {
  ctx.body = await service.getGalleryAsync('/')
}
