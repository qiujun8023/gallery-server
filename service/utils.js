'use strict'

const crypto = require('crypto')

const IMG_EXT = ['.png', '.jpg', '.jpeg', '.bmp', '.gif']

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
