require('./main.less')
const pswpInit = require('./pswp.init')

const MAX_ROW_HEIGHT = 200
const MID_ROW_HEIGHT = 150

let getMarginWidth = function (count) {
  return 10 + count * 4
}

let getAlbumHtml = function (item, width, height) {
  let thumbHtml = ''
  for (let thumbnail of item.thumbnails) {
    thumbHtml += `<div class="cropped" style="background-image: url('${thumbnail}')"></div>`
  }
  return `
    <a class="album" href="${item.url}" style="width: ${width}px; height: ${height}px">
      <span class="lable">
        <span class="title">${item.name}</span>
      </span>
      <div class="container">${thumbHtml}</div>
    </a>
  `
}

let getImageHtml = function (item, width, height) {
  return `
    <div class="image" data-src="${item.url}"
      data-size="${item.meta.width}x${item.meta.height}"
      style="width: ${width}px; height: ${height}px">
      <span class="lable">
        <span class="title">${item.name}</span>
      </span>
      <div class="container">
        <img src="${item.thumbUrl}" alt="${item.name}">
      </div>
    </div>
  `
}

let addAlbumRowHtml = function (el, row, rowHeight) {
  let rowHtml = ''
  for (let item of row) {
    if (item.type === 'ALBUM') {
      rowHtml += getAlbumHtml(item, rowHeight, rowHeight)
    } else {
      let width = item.meta.width / item.meta.height * rowHeight
      rowHtml += getImageHtml(item, width, rowHeight)
    }
  }
  rowHtml = `<div class="row" style="height: ${rowHeight}px">${rowHtml}</div>`
  el.innerHTML += rowHtml
}

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

let splitRows = function (el, data, clientWidth) {
  let row = {}
  for (let item of data) {
    row = pushRow(row, item, clientWidth)
    if (row.height < MAX_ROW_HEIGHT) {
      addAlbumRowHtml(el, row.data, row.height)
      row = {}
    }
  }

  if (row.data && row.data.length) {
    let rowHeight = Math.min(row.height, MID_ROW_HEIGHT)
    addAlbumRowHtml(el, row.data, rowHeight)
  }
}

window.initAlbums = function (className, data) {
  let el = document.getElementsByClassName(className)[0]
  el.innerHTML = ''
  let {clientWidth} = window.document.body
  splitRows(el, data, clientWidth)
  pswpInit('.' + className)
}
