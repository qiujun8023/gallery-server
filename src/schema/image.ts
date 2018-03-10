import * as graphql from 'graphql'

import upyun from '../service/upyun'
import { GalleryImage } from '../types'

let imageUrlType = new graphql.GraphQLObjectType({
  name: 'ImageUrl',
  fields: {
    original: {
      type: graphql.GraphQLString,
      async resolve (path: string) {
        return upyun.getFileUrl(path)
      }
    },
    thumbnail: {
      type: graphql.GraphQLString,
      async resolve (path: string) {
        return upyun.getThumbnailUrl(path)
      }
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
      async resolve (image: GalleryImage) {
        return upyun.getMetaWithCache(image.path)
      }
    },
    url: {
      type: imageUrlType,
      resolve (image: GalleryImage) {
        return image.path
      }
    }
  }
})
