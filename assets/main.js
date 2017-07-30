require('./main.less')
require('./swipe')
const $ = require('jquery')

let getMarginWidth = function (count) {
  return 10 + count * 4
}

let getAlbumHtml = function (item, width, height) {
  let thumbHtml = ''
  for (let thumbnail of item.thumbnails) {
    thumbHtml += `<div class="cropped" style="background-image: url('${thumbnail}')"></div>`
  }
  return `
    <a class="album" href="${item.path}" style="width: ${width}px; height: ${height}px">
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

let splitRows = function (data, clientWidth, maxRowHeight) {
  let row = []
  let ratio = 0
  let rowHeight
  for (let item of data) {
    row.push(item)
    if (item.type === 'ALBUM') {
      ratio += 1
    } else {
      ratio += item.meta.width / item.meta.height
    }
    rowHeight = (clientWidth - getMarginWidth(row.length)) / ratio
    if (rowHeight < maxRowHeight) {
      addAlbumRowHtml(row, rowHeight)
      row = []
      ratio = 0
    }
  }
  if (row.length) {
    addAlbumRowHtml(row, maxRowHeight)
  }
}

window.initAlbums = function (data) {
  $('#albums').html('')
  let {clientWidth} = window.document.body
  let maxRowHeight = 300
  if (clientWidth < 720) {
    maxRowHeight = 200
  }
  splitRows(data, clientWidth, maxRowHeight)
}
