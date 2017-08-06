import './main.less'
import splitRows from './split_row'
import pswpInit from './pswp.init'
import lazyload from './lazyload'

let initAlbums = function (className, data) {
  let {clientWidth} = window.document.body
  splitRows(className, data, clientWidth)
  pswpInit('.' + className)
  lazyload('.albums>.row>.image', '.container>.spinner', '.container>img')
}

window.initAlbums = initAlbums
export default initAlbums
