import '../css/main.less'
import '../img/favicon.png'
import draw from './draw'
import pswpInit from './pswp.init'
import lazyload from './lazyload'
import question from './question'
import {getBodyWidth, htmlToElement} from './utils'

let initAlbums = function (album, bodyWidth) {
  if (album.question) {
    question([album])(album.path, true)
    return
  }

  let albumsEl = document.querySelectorAll('.albums')[0]
  draw(albumsEl, album.data, bodyWidth)
  pswpInit([albumsEl])
  lazyload('.albums>.row>.album .cover', '.spinner', '.cropped')
  lazyload('.albums>.row>.image', '.spinner', '.container>img')
  window.askQuestion = question(album.data)
}

let init = function (album) {
  if (album.description) {
    let html = `<div class="description">${album.description}</div>`
    let navbarEl = document.getElementById('navbar')
    navbarEl.appendChild(htmlToElement(html))
  }

  let bodyWidth = getBodyWidth()
  initAlbums(album, bodyWidth)
  window.onresize = function () {
    let newWidth = getBodyWidth()
    if (newWidth !== bodyWidth) {
      bodyWidth = newWidth
      initAlbums(album, bodyWidth)
    }
  }
}

export default init
