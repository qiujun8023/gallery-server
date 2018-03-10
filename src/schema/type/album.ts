import * as graphql from 'graphql'

export default new graphql.GraphQLObjectType({
  name: 'Album',
  fields: {
    path: {
      type: graphql.GraphQLString
    },
    name: {
      type: graphql.GraphQLString
    },
    type: {
      type: graphql.GraphQLString
    },
    question: {
      type: graphql.GraphQLString
    },
    thumbnails: {
      type: new graphql.GraphQLList(graphql.GraphQLString)
    },
    description: {
      type: graphql.GraphQLString
    }
  }
})
