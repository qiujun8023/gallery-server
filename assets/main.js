import './main.less'
import filling from './filling'
import pswpInit from './pswp.init'
import lazyload from './lazyload'

let initAlbums = function (className, data) {
  let {clientWidth} = window.document.body
  filling(className, data, clientWidth)
  pswpInit('.' + className)
  lazyload('.albums>.row>.image', '.spinner', '.container>img')
}

window.initAlbums = initAlbums
export default initAlbums
