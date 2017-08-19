import filling from './filling'
import question from './question'

const MAX_ROW_HEIGHT = 200
const MID_ROW_HEIGHT = 150

// 获取相册中 Margin 所占用的宽度
let getMarginWidth = function (count) {
  return 10 + count * 4
}

// 将 item 添加到 row
let pushRow = function (row, item, clientWidth) {
  row = Object.assign({
    data: [],
    ratio: 0,
    height: 0
  }, row || {})
  row.data = row.data.concat([])
  row.data.push(item)
  if (item.type === 'ALBUM') {
    row.ratio += 1
  } else {
    row.ratio += item.meta.width / item.meta.height
  }
  row.height = (clientWidth - getMarginWidth(row.data.length)) / row.ratio
  return row
}

// 将数据分割成每行
let splitRows = function (className, data, clientWidth) {
  let els = document.getElementsByClassName(className)
  if (!els || !els.length) {
    return false
  }
  let el = els[0]
  el.innerHTML = ''

  let row = {}
  let previousRow = {}
  for (let item of data) {
    row = pushRow(row, item, clientWidth)
    if (row.height < MAX_ROW_HEIGHT) {
      filling(el, row.data, row.height)
      previousRow = row
      row = {}
    }
  }

  if (row.data && row.data.length) {
    let rowHeight = Math.min(row.height, MID_ROW_HEIGHT)
    if (previousRow && previousRow.height) {
      rowHeight = Math.max(rowHeight, previousRow.height)
    }
    filling(el, row.data, rowHeight)
  }
  window.askQuestion = question(data)
}

let init = function (className, album, clientWidth) {
  if (album.question) {
    question([album])(album.path, true)
    return
  }

  splitRows(className, album.data, clientWidth)
}

export default init
