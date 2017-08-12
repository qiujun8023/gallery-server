import inView from 'in-view'

let onView = function (el, iconSelector, imgSelector) {
  let imgEl = el.querySelector(imgSelector)
  let iconEl = el.querySelector(iconSelector)
  if (!imgEl || imgEl.getAttribute('data-lazyload')) {
    return
  }

  imgEl.setAttribute('data-lazyload', '1')
  let onload = function () {
    iconEl.style.display = 'none'
    imgEl.style.display = 'block'
    imgEl.style.opacity = 1
    if (type !== 'src') {
      imgEl.style.backgroundImage = `url(${src})`
    }
  }

  let src = imgEl.getAttribute('data-src')
  let type = imgEl.getAttribute('data-type') || 'src'
  if (type !== 'src') {
    let img = new window.Image()
    img.onload = onload
    img.src = src
  } else {
    imgEl.onload = onload
    imgEl.setAttribute('src', src)
  }
}

let lazyload = function (LazyloadSelector, iconSelector, imgSelector) {
  inView(LazyloadSelector).on('enter', function (el) {
    onView(el, iconSelector, imgSelector)
  })
}

export default lazyload
