'use strict'

const _ = require('lodash')
const config = require('config')
const router = require('koa-router')()
const service = require('../service')
const albumView = require('../views/album')
const errorView = require('../views/error')
const questionView = require('../views/question')

let getTitle = function (title) {
  let titles = [title]
  if (config.title) {
    titles.push(config.title)
  }
  return titles.join(' - ')
}

router.all('/:path*', async function (ctx) {
  let path = '/' + (ctx.params.path || '')
  let {answer} = ctx.request.body
  let allowed = ctx.session.allowed || []
  let album = config.albums[path] || {}
  let navbar = service.getNavbarInfo(path)

  // 需要回答问题访问
  if (album.question && allowed.indexOf(path) === -1) {
    // 设置问题未设置答案
    if (!album.answer) {
      let title = getTitle('配置有误')
      let error = '配置有误，当前相册尚未配置答案'
      ctx.body = errorView({title, navbar, error})
      return false
    // 问题答案与预制答案不对
    } else if (album.answer !== answer) {
      let title = getTitle('访问受限')
      let data = JSON.stringify([{
        type: 'ALBUM',
        question: album.question,
        path: path,
        url: config.baseUrl + _.trimStart(path, '/')
      }])
      ctx.body = questionView({title, navbar, data, path})
      return false
    } else {
      allowed.push(path)
      ctx.session.allowed = allowed
    }
  }

  let data = await service.getAlbumAsync(path)
  if (!data || !data.data || !data.data.length) {
    let title = getTitle('NotFound')
    let error = '未找到相关相册或此相册为空'
    ctx.body = errorView({title, navbar, error})
    return false
  }

  // 已回答过的答案无需重复回答
  for (let item of data.data) {
    if (allowed.indexOf(item.path) !== -1) {
      item.question = null
    }
  }

  let title = getTitle(data.name)
  ctx.body = albumView({
    title,
    navbar,
    name: data.name,
    description: data.description,
    data: JSON.stringify(data.data)
  })
})

module.exports = () => router.routes()
