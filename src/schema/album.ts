import * as graphql from 'graphql'

import imageType from './image'
import gallery from '../service/gallery'
import { GalleryAlbum, GalleryImage } from '../types'

let albumType: any = new graphql.GraphQLObjectType({
  name: 'Album',
  fields: () => ({
    path: {
      type: graphql.GraphQLString
    },
    name: {
      type: graphql.GraphQLString
    },
    description: {
      type: graphql.GraphQLString
    },
    questions: {
      type: new graphql.GraphQLList(graphql.GraphQLString),
      resolve (album: GalleryAlbum): string[] {
        return Object.keys(album.questions)
      }
    },
    thumbnails: {
      type: new graphql.GraphQLList(graphql.GraphQLString),
      async resolve (album: GalleryAlbum): Promise<string[]> {
        return gallery.getThumbnails(album.path)
      }
    },
    images: {
      type: new graphql.GraphQLList(imageType),
      async resolve (album: GalleryAlbum): Promise<GalleryImage[]> {
        return gallery.getImages(album.path)
      }
    },
    albums: {
      type: new graphql.GraphQLList(albumType),
      async resolve (album: GalleryAlbum): Promise<GalleryAlbum[]> {
        return gallery.getAlbums(album.path)
      }
    }
  })
})

export default albumType
