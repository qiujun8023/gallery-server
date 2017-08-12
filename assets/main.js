import './main.less'
import filling from './filling'
import pswpInit from './pswp.init'
import lazyload from './lazyload'
import {htmlToElement} from './utils'

let initAlbums = function (album, clientWidth) {
  filling('albums', album, clientWidth)
  pswpInit('.albums')
  lazyload('.albums>.row>.album .cover', '.spinner', '.cropped')
  lazyload('.albums>.row>.image', '.spinner', '.container>img')
}

let init = function (album) {
  if (album.description) {
    let html = `<div class="description">${album.description}</div>`
    let navbarEl = document.getElementById('navbar')
    navbarEl.appendChild(htmlToElement(html))
  }

  let {clientWidth} = window.document.body
  initAlbums(album, clientWidth)
  window.onresize = function () {
    let newWidth = window.document.body.clientWidth
    if (newWidth !== clientWidth) {
      clientWidth = newWidth
      initAlbums(album, clientWidth)
    }
  }
}

window.init = init
export default init
