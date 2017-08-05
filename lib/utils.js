'use strict'

exports.urlJoin = function (...args) {
  return args.join('/').replace(/\/{2,}/g, '/')
}
