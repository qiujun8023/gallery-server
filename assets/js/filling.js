import {htmlToElement} from './utils'

// 生成单个相册的HTML代码
let getAlbumHtml = function (item, width, height) {
  let thumbHtml = ''
  for (let thumbnail of item.thumbnails) {
    thumbHtml += `
      <div class="cover">
        <div class="spinner">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
        <div class="cropped" data-src="${thumbnail}" data-type="bg"></div>
      </div>
    `
  }

  // 私有相册，需要回答问题后访问
  if (item.question) {
    return `
      <div class="album" onclick="askQuestion('${item.path}')"
        style="width: ${width}px; height: ${height}px">
        <div class="lock">
          <i class="fa fa-lock"></i>
        </div>
        <span class="lable">
          <span class="title">${item.name}</span>
        </span>
        <div class="container">${thumbHtml}</div>
      </div>
    `
  }

  // 公开相册
  return `
    <a class="album" href="${item.url}"
      style="width: ${width}px; height: ${height}px; ">
      <span class="lable">
        <span class="title">${item.name}</span>
      </span>
      <div class="container">${thumbHtml}</div>
    </a>
  `
}

// 拼接照片 EXIF 信息
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

// 生成单张图片的 HTML 代码
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
      <div class="spinner">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
      </div>
      <span class="lable">
        <span class="title">${item.name}</span>
      </span>
      <div class="container">
        <img data-src="${item.thumbnailUrl}" alt="${item.name}">
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

// 生成单行HTML代码
let filling = function (el, row, rowHeight) {
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

export default filling
