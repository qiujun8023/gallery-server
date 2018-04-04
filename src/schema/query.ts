import * as graphql from 'graphql'
import config from 'config'

import albumType from './album'
import serverType from './server'
import { pathJoin } from '../lib/utils'
import { GalleryAlbum, OutputServer, ServerConfig } from '../types'
import gallery from '../service/gallery'

export default new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    server: {
      type: serverType,
      resolve (): OutputServer {
        let serveerConfig: ServerConfig = config.get('server')
        return { title: serveerConfig.title }
      }
    },

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
