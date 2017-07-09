'use strict'

const path = require('path')

module.exports = {
  host: 'localhost',
  port: '8005',
  baseUrl: 'http://localhost:8005/',

  env: 'development',

  keys: ['im a newer secret', 'i like turtle'],

  session: {
    secret: 'album secret',
    name: 'SESSION'
  },

  redis: {
    host: 'localhost',
    port: 6379,
    keyPrefix: 'album:'
  },

  upyun: {
    bucket: 'gallery',
    operator: 'gallery',
    password: 'gallery',
    token: 'toekn', // token 防盗链，未设置则为 null
    baseUrl: 'http://example.com/'
  },

  gallery: {
    '/': {
      name: '这是名称，默认问文件夹名称',
      description: '这是描述，默认为 null',
      thumbnails: [
        '001.jpg',
        '002.jpg',
        '可选 1-4 张图片，默认为最前面的四张图片'
      ],
      question: '这是问题，默认为 null',
      answer: '这是答案，默认为 null'
    }
  },

  staticDir: path.join(__dirname, '../static')
}
