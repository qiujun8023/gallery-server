import * as graphql from 'graphql'

export default new graphql.GraphQLObjectType({
  name: 'Server',
  fields: {
    title: {
      type: graphql.GraphQLString
    }
  }
})
