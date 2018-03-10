import * as graphql from 'graphql'

import upyun from '../service/upyun'
import { GalleryImage, UpYunFileMeta } from '../types'

let imageUrlType = new graphql.GraphQLObjectType({
  name: 'ImageUrl',
  fields: {
    original: {
      type: graphql.GraphQLString,
      resolve (path: string): string {
        return upyun.getFileUrl(path)
      }
    },
    thumbnail: {
      type: graphql.GraphQLString,
      resolve (path: string): string {
        return upyun.getThumbnailUrl(path)
      }
    }
  }
})

let imageMetaExifType = new graphql.GraphQLObjectType({
  name: 'ImageMetaExif',
  fields: {
    Model: { // 机型
      type: graphql.GraphQLString
    },
    FNumber: { // 光圈
      type: graphql.GraphQLString
    },
    ShutterSpeedValue: { // 快门速度
      type: graphql.GraphQLString
    },
    ISOSpeedRatings: { // ISO 感光度
      type: graphql.GraphQLString
    },
    DateTimeOriginal: { // 拍摄时间
      type: graphql.GraphQLString
    }
  }
})

let imageMetaType = new graphql.GraphQLObjectType({
  name: 'ImageMeta',
  fields: {
    width: {
      type: graphql.GraphQLInt
    },
    height: {
      type: graphql.GraphQLInt
    },
    frames: {
      type: graphql.GraphQLInt
    },
    type: {
      type: graphql.GraphQLString
    },
    EXIF: {
      type: imageMetaExifType
    }
  }
})

export default new graphql.GraphQLObjectType({
  name: 'Image',
  fields: {
    path: {
      type: graphql.GraphQLString
    },
    name: {
      type: graphql.GraphQLString
    },
    meta: {
      type: imageMetaType,
      async resolve (image: GalleryImage): Promise<UpYunFileMeta> {
        return upyun.getMetaWithCache(image.path)
      }
    },
    url: {
      type: imageUrlType,
      resolve (image: GalleryImage): string {
        return image.path
      }
    }
  }
})
