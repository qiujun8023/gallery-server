'use strict'

const config = require('config')
const router = require('koa-router')()
const service = require('../service')
const albumView = require('../views/album')
const errorView = require('../views/error')

let getTitle = function (title) {
  let titles = [title]
  if (config.title) {
    titles.push(config.title)
  }
  return titles.join(' - ')
}

router.all('/:path*', async function (ctx) {
  let path = '/' + (ctx.params.path || '')
  let allowed = ctx.session.allowed || []
  let userAnswer = (ctx.request.body || {}).answer
  let {question, answer} = config.albums[path] || {}
  let navbar = service.getNavbarInfo(path)

  let isAllowed = true
  // 需要回答问题访问
  if (question && allowed.indexOf(path) === -1) {
    // 设置问题未设置答案
    if (!answer) {
      let title = getTitle('配置有误')
      let error = '配置有误，当前相册尚未配置答案'
      ctx.body = errorView({title, navbar, error})
      return false
    // 问题答案与预制答案相同
    } else if (userAnswer === answer) {
      allowed.push(path)
      ctx.session.allowed = allowed
    } else {
      isAllowed = false
    }
  }

  let album = await service.getAlbumAsync(path)
  if (!album || !album.data || !album.data.length) {
    let title = getTitle('NotFound')
    let error = '未找到相关相册或此相册为空'
    ctx.body = errorView({title, navbar, error})
    return false
  }

  // 当前相册无访问权限
  if (!isAllowed) {
    album.data = []
  } else {
    album.question = null
    // 已回答过的答案无需重复回答
    for (let item of album.data) {
      if (allowed.indexOf(item.path) !== -1) {
        item.question = null
      }
    }
  }

  let title = getTitle(album.name)
  album = JSON.stringify(album)
  ctx.body = albumView({title, navbar, album})
})

module.exports = () => router.routes()
