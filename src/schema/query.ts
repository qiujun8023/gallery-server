import * as graphql from 'graphql'

import albumType from './album'
import gallery from '../service/gallery'
import { GalleryAlbum, GalleryAlbumQuestions } from '../types'

let answerInputType = new graphql.GraphQLInputObjectType({
  name: 'AnswerInput',
  fields: {
    path: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    },
    answer: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    }
  }
})

export default new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    album: {
      type: albumType,
      args: {
        path: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        answers: {
          type: new graphql.GraphQLList(answerInputType)
        }
      },
      async resolve (obj, { path, answers }, { session }): Promise<GalleryAlbum> {
        session.allowed = session.allowed || []
        let questions: GalleryAlbumQuestions = gallery.getQuestions()
        for (let { path, answer } of answers) {
          if (answer === questions[path].answer) {
            session.allowed.push(path)
          }
        }
        return gallery.getAlbumInfo(path, session.allowed)
      }
    }
  }
})
