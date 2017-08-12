'use strict'

const _ = require('lodash')
const config = require('config')
const upyun = require('./upyun')
const {urlJoin} = require('../lib/utils')

const BASE_URL = config.baseUrl
const ALBUM_FILTER = [
  'url', 'path', 'name', 'type',
  'description', 'thumbnails', 'question'
]

// 从又拍云获取缩略图列表
exports.findThumbnailsAsync = async function (remotePath) {
  let files = await upyun.listDirAsync(remotePath)

  let thumbnails = []
  for (let file of files) {
    if (file.type === 'N') {
      thumbnails.push(file.name)
    }
    if (thumbnails.length >= 4) {
      break
    }
  }
  return thumbnails
}

// 格式化文件信息
exports.formatFileAsync = async function (info, path) {
  let metaUrl = upyun.getImageUrl(path + '!/meta')
  let meta = await upyun.getMetaAsync(path, metaUrl)
  return {
    path,
    name: info.name,
    meta,
    type: 'IMAGE',
    url: upyun.getImageUrl(path),
    thumbnailUrl: upyun.getThumbnailUrl(path)
  }
}

// 格式化图集信息
exports.formatDirAsync = async function (info, path) {
  // 文件夹基本信息
  info = Object.assign({
    path,
    name: info.name,
    type: 'ALBUM',
    description: null,
    thumbnails: [],
    question: null,
    url: BASE_URL + _.trimStart(path, '/')
  }, config.albums[path] || {})
  info.thumbnails = info.thumbnails.slice(0, 4)
  info = _.pick(info, ALBUM_FILTER)

  // 获取缩略图
  if (!info.thumbnails.length) {
    info.thumbnails = await this.findThumbnailsAsync(path)
  }

  // 获取缩略图请求地址
  for (let i = 0; i < info.thumbnails.length; i++) {
    let thumbnailPath = urlJoin(path, info.thumbnails[i])
    info.thumbnails[i] = upyun.getThumbnailUrl(thumbnailPath)
  }
  return info
}

// 获取图集信息
exports.getAlbumAsync = async function (remotePath) {
  // 图集基本信息
  let name = remotePath.split('/').pop()
  let album = await this.formatDirAsync({name}, remotePath)

  // 获取图集信息
  let data = await upyun.listDirAsync(remotePath)
  for (let i = 0; i < data.length; i++) {
    let path = urlJoin(remotePath, data[i].name)
    if (data[i].type === 'F') {
      data[i] = await this.formatDirAsync(data[i], path)
    } else {
      data[i] = await this.formatFileAsync(data[i], path)
    }
  }

  // 删除空图集
  album.data = data.filter((item) => {
    return item.type === 'IMAGE' || Boolean(item.thumbnails.length)
  })

  return album
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

  if (!res[0].name || res[0].name === '/') {
    res[0].name = 'Home'
  }

  return res
}
