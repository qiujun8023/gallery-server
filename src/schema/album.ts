import _ from 'lodash'
import * as graphql from 'graphql'

import imageType from './image'
import gallery from '../service/gallery'
import { GalleryAlbum, GalleryImage, OutputQuestion } from '../types'

let questionType = new graphql.GraphQLObjectType({
  name: 'AlbumQuestion',
  fields: {
    path: {
      type: graphql.GraphQLString
    },
    question: {
      type: graphql.GraphQLString
    }
  }
})

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
      type: new graphql.GraphQLList(questionType),
      resolve (album: GalleryAlbum): OutputQuestion[] {
        let questions = []
        for (let path in album.questions) {
          let { question } = album.questions[path]
          questions.push({ path, question })
        }
        return questions
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
        if (!_.isEmpty(album.questions)) {
          return []
        }
        return gallery.getImages(album.path)
      }
    },
    albums: {
      type: new graphql.GraphQLList(albumType),
      async resolve (album: GalleryAlbum, params, { session }): Promise<GalleryAlbum[]> {
        if (!_.isEmpty(album.questions)) {
          return []
        }
        return gallery.getAlbums(album.path, session.allowed || [])
      }
    }
  })
})

export default albumType
