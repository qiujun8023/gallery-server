'use strict'

const _ = require('lodash')

exports.urlJoin = function (...args) {
  return args.join('/').replace(/\/{2,}/g, '/')
}
