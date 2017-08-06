const MAX_ROW_HEIGHT = 200
const MID_ROW_HEIGHT = 150

let getMarginWidth = function (count) {
  return 10 + count * 4
}

let htmlToElement = function (html) {
  let template = document.createElement('template')
  template.innerHTML = html
  return template.content.firstChild
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

let getExifInfo = function (meta) {
  let info = []
  let {FNumber, ShutterSpeedValue, ISOSpeedRatings} = meta.EXIF
  if (FNumber) {
    FNumber = FNumber.split('/')
    if (FNumber.length === 2) {
      info.push('f/' + FNumber[0] / FNumber[1])
    }
  }
  if (ShutterSpeedValue) {
    ShutterSpeedValue = ShutterSpeedValue.split('/')
    if (ShutterSpeedValue.length === 2) {
      info.push('1/' + (2 ^ (ShutterSpeedValue[0] / ShutterSpeedValue[1])) + 's')
    }
  }
  if (ISOSpeedRatings) {
    info.push('ISO' + ISOSpeedRatings)
  }
  if (!info.length) {
    return 'Unknown'
  }
  return info.join(', ')
}

let getImageHtml = function (item, width, height) {
  item.meta.EXIF = item.meta.EXIF || {}
  let name = item.name
  let model = item.meta.EXIF.Model || 'Unknown'
  let info = getExifInfo(item.meta)
  let time = item.meta.EXIF.DateTimeOriginal || 'Unknown'
  return `
    <div class="image" data-src="${item.url}"
      data-size="${item.meta.width}x${item.meta.height}"
      style="width: ${width}px; height: ${height}px">
      <span class="lable">
        <span class="title">${item.name}</span>
      </span>
      <div class="container">
        <img data-src="${item.thumbUrl}" alt="${item.name}">
        <div class="spinner">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
      </div>
      <div class="extra">
        <p class="exif">
          <b><i class="fa fa-camera"></i></b>
          <span>${model}</span>
        </p>
        <p class="exif">
          <b><i class="fa fa-image"></i></b>
          <span>${name}</span>
        </p>
        <p class="exif">
          <b><i class="fa fa-film"></i></b>
          <span>${info}</span>
        </p>
        <p class="exif">
          <b><i class="fa fa-clock-o"></i></b>
          <span>${time}</span>
        </p>
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
  el.appendChild(htmlToElement(rowHtml))
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

let splitRows = function (className, data, clientWidth) {
  let els = document.getElementsByClassName(className)
  if (!els || !els.length) {
    return false
  }
  let el = els[0]
  el.innerHTML = ''

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

export default splitRows
