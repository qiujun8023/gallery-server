import * as graphql from 'graphql'

import albumType from './album'
import gallery from '../service/gallery'
import { GalleryAlbum } from '../types'

export default new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    album: {
      type: albumType,
      args: {
        path: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
      },
      async resolve (obj, { path }): Promise<GalleryAlbum> {
        return gallery.getAlbumInfo(path)
      }
    }
  }
})
