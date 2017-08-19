import filling from './filling'
import {getBodyWidth} from './utils'

const MAX_ROW_HEIGHT = 200
const MID_ROW_HEIGHT = 150

// 获取相册中 Margin 所占用的宽度
let getMarginWidth = function (count) {
  return 10 + count * 4
}

// 将 item 添加到 row
let pushRow = function (row, item, bodyWidth) {
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
  row.height = (bodyWidth - getMarginWidth(row.data.length)) / row.ratio
  return row
}

// 将数据分割成每行
let draw = function (el, data, bodyWidth) {
  el.innerHTML = ''

  let row = {}
  let previousHeight = 0
  for (let i = 0; i < data.length; i++) {
    row = pushRow(row, data[i], bodyWidth)
    if (row.height < MAX_ROW_HEIGHT) {
      filling(el, row.data, row.height)
      previousHeight = row.height
      row = {}
    } else if (i + 1 === data.length) {
      let rowHeight = Math.min(row.height, MID_ROW_HEIGHT)
      filling(el, row.data, Math.max(rowHeight, previousHeight))
    } else {
      continue
    }

    // 判断浏览器宽度变化
    let newBodyWidth = getBodyWidth()
    if (newBodyWidth < bodyWidth) {
      return draw(el, data, newBodyWidth)
    }
  }
}

export default draw
