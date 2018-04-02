import * as graphql from 'graphql'

import gallery from '../service/gallery'
import answerType from './answer'
import { GalleryAlbumQuestions, OutputAnswer } from '../types'

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
  name: 'Mutation',
  fields: {
    answer: {
      type: answerType,
      args: {
        answers: {
          type: new graphql.GraphQLNonNull(new graphql.GraphQLList(answerInputType))
        }
      },
      resolve (obj, { answers }, { session }): OutputAnswer {
        session.allowed = session.allowed || []
        let questions: GalleryAlbumQuestions = gallery.getQuestions()
        for (let { path, answer } of answers) {
          if (!questions[path]) {
            continue
          } else if (questions[path].answer === answer) {
            session.allowed.push(path)
          }
        }
        session.allowed = Array.from(new Set(session.allowed))
        return { allowed: session.allowed }
      }
    }
  }
})
