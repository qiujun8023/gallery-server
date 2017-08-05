import './photoSwipe/photoswipe.css'
import './photoSwipe/default-skin/default-skin.css'
import PhotoSwipe from './photoSwipe/photoswipe.min'
import PhotoSwipeUIDefault from './photoSwipe/photoswipe-ui-default'

let initPhotoSwipeFromDOM = function (gallerySelector) {
  // parse slide data (url, title, size ...) from DOM elements
  // (children of gallerySelector)
  let parseThumbnailElements = function (el) {
    let thumbElements = el.querySelectorAll('div.image')
    let numNodes = thumbElements.length
    let items = []

    for (let i = 0; i < numNodes; i++) {
      let linkEl = thumbElements[i]

      // include only element nodes
      if (linkEl.nodeType !== 1) {
        continue
      }

      let size = linkEl.getAttribute('data-size').split('x')

      // create slide object
      let item = {
        src: linkEl.getAttribute('data-src'),
        msrc: linkEl.getElementsByTagName('img')[0].getAttribute('src'),
        title: linkEl.getElementsByClassName('extra')[0].innerHTML,
        w: parseInt(size[0], 10),
        h: parseInt(size[1], 10),
        el: linkEl
      }

      items.push(item)
    }

    return items
  }

  // find nearest parent element
  let closest = function closest (el, fn) {
    return el && (fn(el) ? el : closest(el.parentNode, fn))
  }

  // triggers when user clicks on thumbnail
  let onThumbnailsClick = function (e) {
    e = e || window.event
    // e.preventDefault ? e.preventDefault() : e.returnValue = false

    let eTarget = e.target || e.srcElement

    // find root element of slide
    let clickedListItem = closest(eTarget, function (el) {
      let tagName = el.tagName && el.tagName.toLowerCase()
      let className = el.className && el.className.toLowerCase()
      return tagName === 'div' && className === 'image'
    })

    if (!clickedListItem) {
      return
    }

    // find index of clicked item by looping through all child nodes
    // alternatively, you may define index via data- attribute
    let clickedGallery = clickedListItem.parentNode.parentNode
    let childNodes = clickedGallery.querySelectorAll('div.image')
    let numChildNodes = childNodes.length
    let nodeIndex = 0
    let index

    for (let i = 0; i < numChildNodes; i++) {
      if (childNodes[i].nodeType !== 1) {
        continue
      }

      if (childNodes[i] === clickedListItem) {
        index = nodeIndex
        break
      }
      nodeIndex++
    }

    if (index >= 0) {
      // open PhotoSwipe if valid index found
      openPhotoSwipe(index, clickedGallery)
    }
    return false
  }

  // parse picture index and gallery index from URL (#&pid=1&gid=2)
  let photoswipeParseHash = function () {
    let hash = window.location.hash.substring(1)
    let params = {}

    if (hash.length < 5) {
      return params
    }

    let vars = hash.split('&')
    for (let i = 0; i < vars.length; i++) {
      if (!vars[i]) {
        continue
      }
      let pair = vars[i].split('=')
      if (pair.length < 2) {
        continue
      }
      params[pair[0]] = pair[1]
    }

    if (params.gid) {
      params.gid = parseInt(params.gid, 10)
    }

    return params
  }

  let openPhotoSwipe = function (index, galleryElement, disableAnimation, fromURL) {
    let pswpElement = document.querySelectorAll('.pswp')[0]

    let items = parseThumbnailElements(galleryElement)

    // define options (if needed)
    let options = {

      // define gallery index (for URL)
      galleryUID: galleryElement.getAttribute('data-pswp-uid'),

      getThumbBoundsFn: function (index) {
        // See Options -> getThumbBoundsFn section of documentation for more info
        let thumbnail = items[index].el.getElementsByTagName('img')[0] // find thumbnail
        let pageYScroll = window.pageYOffset || document.documentElement.scrollTop
        let rect = thumbnail.getBoundingClientRect()

        return {x: rect.left, y: rect.top + pageYScroll, w: rect.width}
      }

    }

    // PhotoSwipe opened from URL
    if (fromURL) {
      if (options.galleryPIDs) {
        // parse real index when custom PIDs are used
        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
        for (let j = 0; j < items.length; j++) {
          if (Number(items[j].pid) === Number(index)) {
            options.index = j
            break
          }
        }
      } else {
        // in URL indexes start from 1
        options.index = parseInt(index, 10) - 1
      }
    } else {
      options.index = parseInt(index, 10)
    }

    // exit if index not found
    if (isNaN(options.index)) {
      return
    }

    if (disableAnimation) {
      options.showAnimationDuration = 0
    }

    // Pass data to PhotoSwipe and initialize it
    let gallery = new PhotoSwipe(pswpElement, PhotoSwipeUIDefault, items, options)
    gallery.init()
  }

  // loop through all gallery elements and bind events
  let galleryElements = document.querySelectorAll(gallerySelector)

  for (let i = 0, l = galleryElements.length; i < l; i++) {
    galleryElements[i].setAttribute('data-pswp-uid', i + 1)
    galleryElements[i].onclick = onThumbnailsClick
  }

  // Parse URL and open gallery if it contains #&pid=3&gid=1
  let hashData = photoswipeParseHash()
  if (hashData.pid && hashData.gid) {
    openPhotoSwipe(hashData.pid, galleryElements[ hashData.gid - 1 ], true, true)
  }
}

module.exports = initPhotoSwipeFromDOM
