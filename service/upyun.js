'use strict'

const _ = require('lodash')
const rp = require('request-promise')
const config = require('config')
const upyun = require('upyun')
const redis = require('../lib/redis')
const logger = require('../lib/logger')
const utils = require('./utils')

const MIN_IMAGE_CACHE_TIME = 300
const MAX_IMAGE_CACHE_TIME = 600
const MIN_META_CACHE_TIME = 43200
const MAX_META_CACHE_TIME = 86400

const EXIF_FILTER = [
  'Model', 'FNumber', 'ShutterSpeedValue',
  'ISOSpeedRatings', 'DateTimeOriginal'
]
const UPYUN_LAST_PAGE_ITER = 'g2gCZAAEbmV4dGQAA2VvZg'

// 创建 upyun sdk 实例
let {bucket, operator, password} = config.upyun
let clientConfig = new upyun.Bucket(bucket, operator, password)
let client = new upyun.Client(clientConfig)

// 图片排序，图集优先
exports.sortFiles = function (files) {
  files.sort(function (a, b) {
    if (a.type === 'F' && b.type !== 'F') {
      return -1
    } else if (a.type !== 'F' && b.type === 'F') {
      return 1
    }
    return a.name > b.name ? 1 : -1
  })
  return files
}

// 获取图片访问地址
exports.getImageUrl = function (path) {
  let {baseUrl, token} = config.upyun
  let query = ''
  if (token) {
    let etime = Math.round(Date.now() / 1000) + 1800
    let sign = utils.md5(`${token}&${etime}&${path}`).substr(12, 8)
    query = `?_upt=${sign}${etime}`
  }

  path = path.split('/').map(encodeURIComponent).join('/')
  return baseUrl + _.trimStart(path, '/') + query
}

// 获取缩略图访问地址
exports.getThumbnailUrl = function (path) {
  return this.getImageUrl(path + config.upyun.makeThumbnail)
}

// 又拍云文件列表缓存时间
exports.getImageCacheTime = function () {
  return _.random(MIN_IMAGE_CACHE_TIME, MAX_IMAGE_CACHE_TIME)
}

// 图片元信息缓存时间
exports.getMetaCacheTime = function () {
  return _.random(MIN_META_CACHE_TIME, MAX_META_CACHE_TIME)
}

// 从又拍云获取文件列表
exports.listDirAsync = async function (remotePath) {
  let cacheKey = 'images:' + utils.md5(remotePath)
  let cacheData = await redis.get(cacheKey)
  if (cacheData) {
    return JSON.parse(cacheData)
  }

  let iter
  let data = []
  do {
    let res = await client.listDir(remotePath, {iter: iter, limit: 1000})
    if (res) {
      data = data.concat(res.files)
      iter = res.next
    }
  } while (iter && iter !== UPYUN_LAST_PAGE_ITER)

  logger.info('request upyun to list dir: %s', remotePath)
  data = utils.sortFiles(utils.filterImg(data))
  let cacheTime = this.getImageCacheTime()
  logger.info('set list to cache, key: %s, ttl: ', cacheKey, cacheTime)
  await redis.setex(cacheKey, cacheTime, JSON.stringify(data))
  return data
}

// 获取图片元数据
exports.getMetaAsync = async function (path, url) {
  let cacheKey = 'meta:' + utils.md5(path)
  let cacheData = await redis.get(cacheKey)
  if (cacheData) {
    return JSON.parse(cacheData)
  }

  logger.info('request upyun to fetch meta: %s', path)
  let meta = await rp({url, json: true})
  meta.EXIF = _.pick(meta.EXIF || {}, EXIF_FILTER)

  let cacheTime = this.getMetaCacheTime()
  logger.info('set meta to cache, key: %s, ttl: ', cacheKey, cacheTime)
  await redis.setex(cacheKey, cacheTime, JSON.stringify(meta))
  return meta
}
