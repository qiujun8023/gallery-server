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

// 将 HTML 装换为DOM元素
let htmlToElement = function (html) {
  let child = document.createElement('div')
  child.innerHTML = html
  return child.firstChild
}

// 获取可见区域宽度
let getBodyWidth = function () {
  return window.document.body.clientWidth
}

export {post, htmlToElement, getBodyWidth}
