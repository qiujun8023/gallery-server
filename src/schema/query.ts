import * as graphql from 'graphql'

import albumType from './album'
import { pathJoin } from '../lib/utils'
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
      async resolve (obj, { path }, { session }): Promise<GalleryAlbum> {
        path = pathJoin('/', path)
        session.allowed = session.allowed || []
        return gallery.getAlbumInfo(path, session.allowed)
      }
    }
  }
})
