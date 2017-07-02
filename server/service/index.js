'use strict'

const crypto = require('crypto')
const _ = require('lodash')
const config = require('config')
const upyun = require('upyun')
const redis = require('../lib/redis')
const urlJoin = require('../lib/url_join')

const CACHE_TIME = 300
const IMG_EXT = ['.png', '.jpg', '.jpeg', '.bmp', '.gif']
const META_FILTER = ['name', 'description', 'data']
const ITEM_FILTER = ['path', 'name', 'type', 'description', 'thumbnails', 'question']

// 创建 upyun sdk 实例
let {bucket, operator, password} = config.upyun
let clientConfig = new upyun.Bucket(bucket, operator, password)
let client = new upyun.Client(clientConfig)

// MD5
exports.md5 = function (str) {
  return crypto.createHash('md5').update(str).digest('hex')
}

// 过滤非图片文件
exports.filterImg = function (files) {
  return files.filter((file) => {
    if (file.type === 'N') {
      let name = file.name.toLowerCase()
      var index = name.lastIndexOf('.')
      if (index === -1) {
        return false
      }
      let ext = name.substring(index)
      if (IMG_EXT.indexOf(ext) === -1) {
        return false
      }
    }
    return true
  })
}

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

// 从又拍云获取文件列表
exports.listDirAsync = async function (remotePath) {
  let data = await redis.get(remotePath)
  if (data) {
    return JSON.parse(data)
  } else {
    data = []
  }

  let iter
  do {
    let res = await client.listDir(remotePath, {iter, limit: 1000})
    data = data.concat(res.files)
    iter = res.iter
  } while (iter)

  data = this.sortFiles(this.filterImg(data))
  await redis.setex(remotePath, CACHE_TIME, JSON.stringify(data))
  return data
}

// 从又拍云获取缩略图列表
exports.findThumbnailsAsync = async function (remotePath) {
  let files = await this.listDirAsync(remotePath)
  return _.map(files.slice(0, 4), 'name')
}

// 获取图片访问地址
exports.getFileUrlAsync = async function (path) {
  let {baseUrl, token} = config.upyun
  if (!token) {
    return baseUrl + _.trimStart(path, '/')
  }
  let etime = Math.round(Date.now() / 1000) + 1800
  let sign = this.md5(`${token}&${etime}&${path}`).substr(12, 8)
  return baseUrl + _.trimStart(path, '/') + `?_upt=${sign}${etime}`
}

// 格式化文件信息
exports.formatFileAsync = async function (info, path) {
  return {
    path,
    name: info.name,
    type: 'IMAGE',
    url: await this.getFileUrlAsync(path)
  }
}

// 格式化图集信息
exports.formatDirAsync = async function (info, path) {
  // 文件夹基本信息
  info = Object.assign({
    path,
    name: info.name,
    type: 'GALLERY',
    description: null,
    thumbnails: [],
    question: null
  }, config.gallery[path] || {})
  info.thumbnails = info.thumbnails.concat([])
  info = _.pick(info, ITEM_FILTER)

  // 获取缩略图
  if (!info.thumbnails.length) {
    info.thumbnails = await this.findThumbnailsAsync(path)
  }

  // 获取缩略图请求地址
  for (let i = 0; i < info.thumbnails.length; i++) {
    let thumbnailPath = urlJoin(path, info.thumbnails[i])
    info.thumbnails[i] = await this.getFileUrlAsync(thumbnailPath)
  }
  return info
}

// 获取图集信息
exports.getGalleryAsync = async function (remotePath) {
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
  let gallery = Object.assign({
    name: remotePath,
    description: null,
    data
  }, config.gallery[remotePath] || {})
  return _.pick(gallery, META_FILTER)
}
