import swal from 'sweetalert'

const MAX_ROW_HEIGHT = 200
const MID_ROW_HEIGHT = 150

// 发起 Post 请求，用于提交问题答案
let post = function (path, params) {
  let form = document.createElement('form')
  form.setAttribute('method', 'post')
  form.setAttribute('action', path)

  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      let field = document.createElement('input')
      field.setAttribute('type', 'hidden')
      field.setAttribute('name', key)
      field.setAttribute('value', params[key])
      form.appendChild(field)
    }
  }

  document.body.appendChild(form)
  form.submit()
}

// 输入问题答案，闭包用于保存数据
let questions = function (data) {
  let albums = {}
  for (let item of data) {
    if (item.type !== 'ALBUM') {
      continue
    }
    albums[item.path] = item
  }

  return function (path, force = false) {
    swal({
      title: albums[path].question,
      type: 'input',
      showCancelButton: !force,
      closeOnConfirm: false,
      allowOutsideClick: !force,
      showLoaderOnConfirm: true,
      animation: 'pop',
      inputPlaceholder: '请输入答案，正确即可访问'
    }, function (answer) {
      if (!answer) {
        swal.showInputError('答案不能为空')
        return false
      }

      post(albums[path].url, {answer})
    })
  }
}

// 获取相册中 Margin 所占用的宽度
let getMarginWidth = function (count) {
  return 10 + count * 4
}

// 将 HTML 装换为DOM元素
let htmlToElement = function (html) {
  let template = document.createElement('template')
  template.innerHTML = html
  return template.content.firstChild
}

// 生成单个相册的HTML代码
let getAlbumHtml = function (item, width, height) {
  let thumbHtml = ''
  for (let thumbnail of item.thumbnails) {
    thumbHtml += `<div class="cropped" style="background-image: url('${thumbnail}')"></div>`
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
        <img data-src="${item.thumbUrl}" alt="${item.name}">
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
      addAlbumRowHtml(el, row.data, row.height)
      previousRow = row
      row = {}
    }
  }

  if (row.data && row.data.length) {
    let rowHeight = Math.min(row.height, MID_ROW_HEIGHT)
    if (previousRow && previousRow.height) {
      rowHeight = Math.max(rowHeight, previousRow.height)
    }
    addAlbumRowHtml(el, row.data, rowHeight)
  }
  window.askQuestion = questions(data)
}

window.questions = questions
export default splitRows
