import inView from 'in-view'

let onView = function (el, iconSelector, imgSelector) {
  let imgEl = el.querySelector(imgSelector)
  if (!imgEl || imgEl.getAttribute('src')) {
    return
  }
  imgEl.setAttribute('src', imgEl.getAttribute('data-src'))
  imgEl.onload = function () {
    let iconEl = el.querySelector(iconSelector)
    iconEl.style.display = 'none'
    imgEl.style.display = 'block'
    imgEl.style.opacity = 1
  }
}

let lazyload = function (LazyloadSelector, iconSelector, imgSelector) {
  inView(LazyloadSelector).on('enter', function (el) {
    onView(el, iconSelector, imgSelector)
  })
}

export default lazyload
