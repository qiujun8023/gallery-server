'use strict'

const CronJob = require('cron').CronJob
const logger = require('./lib/logger')
const service = require('./service')

// 定义 Cron 执行频率
const CRON_TIME = '0 */5 * * * *'

let cacheAlbum = async function (remotePath) {
  let album = await service.getAlbumAsync(remotePath)
  for (let item of album.data) {
    if (item.type === 'ALBUM') {
      await cacheAlbum(item.path)
    }
  }
}

let fn = function () {
  return cacheAlbum('/').catch(logger.error)
}

// eslint-disable-next-line
new CronJob({
  cronTime: CRON_TIME,
  onTick: fn,
  start: true,
  runOnInit: true
})
