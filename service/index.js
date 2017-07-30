'use strict'

const _ = require('lodash')
const rp = require('request-promise')
const config = require('config')
const upyun = require('upyun')
const redis = require('../lib/redis')
const logger = require('../lib/logger')
const {urlJoin} = require('../lib/utils')
const utils = require('./utils')

const BASE_URL = config.baseUrl + 'album/'
const MIN_FILE_CACHE_TIME = 600
const MAX_FILE_CACHE_TIME = 1200
const MIN_META_CACHE_TIME = 43200
const MAX_META_CACHE_TIME = 86400
const META_FILTER = ['name', 'description', 'data']
const ITEM_FILTER = ['path', 'name', 'type', 'description', 'thumbnails', 'question']
const UPYUN_LAST_PAGE_ITER = 'g2gCZAAEbmV4dGQAA2VvZg'

// 创建 upyun sdk 实例
let {bucket, operator, password} = config.upyun
let clientConfig = new upyun.Bucket(bucket, operator, password)
let client = new upyun.Client(clientConfig)

// 获取图片访问地址
exports.getFileUrl = function (path) {
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
exports.getThumbFileUrl = function (path) {
  return this.getFileUrl(path + config.upyun.makeThumb)
}

// 又拍云文件列表缓存时间
exports.getFileCacheTime = function () {
  return _.random(MIN_FILE_CACHE_TIME, MAX_META_CACHE_TIME)
}

// 图片元信息缓存时间
exports.getMetaCacheTime = function () {
  return _.random(MIN_META_CACHE_TIME, MAX_FILE_CACHE_TIME)
}

// 从又拍云获取文件列表
exports.listDirAsync = async function (remotePath) {
  let cacheKey = 'files:' + utils.md5(remotePath)
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
  let cacheTime = this.getFileCacheTime()
  logger.info('set list to cache, key: %s, ttl: ', cacheKey, cacheTime)
  await redis.setex(cacheKey, cacheTime, JSON.stringify(data))
  return data
}

// 从又拍云获取缩略图列表
exports.findThumbnailsAsync = async function (remotePath) {
  let files = await this.listDirAsync(remotePath)
  return _.map(files.slice(0, 4), 'name')
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
  let cacheTime = this.getMetaCacheTime()
  logger.info('set meta to cache, key: %s, ttl: ', cacheKey, cacheTime)
  await redis.setex(cacheKey, cacheTime, JSON.stringify(meta))
  return meta
}

// 格式化文件信息
exports.formatFileAsync = async function (info, path) {
  let metaUrl = this.getFileUrl(path + '!/meta')
  let meta = await this.getMetaAsync(path, metaUrl)
  return {
    path,
    name: info.name,
    meta,
    type: 'IMAGE',
    url: this.getFileUrl(path),
    thumbUrl: this.getThumbFileUrl(path)
  }
}

// 格式化图集信息
exports.formatDirAsync = async function (info, path) {
  // 文件夹基本信息
  info = Object.assign({
    path: BASE_URL + _.trimStart(path, '/'),
    name: info.name,
    type: 'ALBUM',
    description: null,
    thumbnails: [],
    question: null
  }, config.albums[path] || {})
  info.thumbnails = info.thumbnails.concat([])
  info = _.pick(info, ITEM_FILTER)

  // 获取缩略图
  if (!info.thumbnails.length) {
    info.thumbnails = await this.findThumbnailsAsync(path)
  }

  // 获取缩略图请求地址
  for (let i = 0; i < info.thumbnails.length; i++) {
    let thumbnailPath = urlJoin(path, info.thumbnails[i])
    info.thumbnails[i] = this.getThumbFileUrl(thumbnailPath)
  }
  return info
}

// 获取图集信息
exports.getAlbumAsync = async function (remotePath) {
  let data = await this.listDirAsync(remotePath)
  for (let i = 0; i < data.length; i++) {
    let path = urlJoin(remotePath, data[i].name)
    if (data[i].type === 'F') {
      data[i] = await this.formatDirAsync(data[i], path)
    } else {
      data[i] = await this.formatFileAsync(data[i], path)
    }
  }

  // 删除空图集
  data = data.filter((item) => {
    return item.type === 'IMAGE' || Boolean(item.thumbnails.length)
  })

  // 图集基本信息
  let album = Object.assign({
    name: remotePath,
    description: null,
    data
  }, config.albums[remotePath] || {})
  return _.pick(album, META_FILTER)
}

exports.getNavbarInfo = function (fullPath) {
  let navbarPath = ''
  let pathInfo = _.trim(fullPath, '/').split('/')
  if (pathInfo.length !== 1 || pathInfo[0]) {
    pathInfo.unshift('')
  }

  let res = []
  let baseUrl = _.trimEnd(BASE_URL, '/')
  for (let i = 0; i < pathInfo.length; i++) {
    navbarPath = '/' + pathInfo[i]
    let url = baseUrl + navbarPath
    let name = pathInfo[i]
    if (config.albums[navbarPath]) {
      name = config.albums[navbarPath].name || name
    }
    res.push({url, name})
  }

  console.log(res)
  if (!res[0].name || res[0].name === '/') {
    res[0].name = 'Home'
  }

  return res
}
