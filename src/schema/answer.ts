import * as graphql from 'graphql'

export default new graphql.GraphQLObjectType({
  name: 'Answer',
  fields: {
    allowed: {
      type: new graphql.GraphQLList(graphql.GraphQLString)
    }
  }
})
