'use strict'

module.exports = function (...args) {
  return args.join('/').replace(/\/{2,}/g, '/')
}
