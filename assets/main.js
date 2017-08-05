require('./main.less')
require('./swipe')
const $ = require('jquery')

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
    <a class="image" style="width: ${width}px; height: ${height}px">
      <span class="lable">
        <span class="title"></span>
      </span>
      <div class="container">
        <img src="${item.thumbUrl}" data-src="${item.url}" alt="${item.name}">
      </div>
    </a>
  `
}

let addAlbumRowHtml = function (row, rowHeight) {
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
  $('#albums').append(rowHtml)
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

let splitRows = function (data, clientWidth) {
  let row = {}
  for (let item of data) {
    row = pushRow(row, item, clientWidth)
    if (row.height < MAX_ROW_HEIGHT) {
      addAlbumRowHtml(row.data, row.height)
      row = {}
    }
  }

  if (row.data && row.data.length) {
    let rowHeight = Math.min(row.height, MID_ROW_HEIGHT)
    addAlbumRowHtml(row.data, rowHeight)
  }
}

window.initAlbums = function (data) {
  $('#albums').html('')
  let {clientWidth} = window.document.body
  splitRows(data, clientWidth)
}
