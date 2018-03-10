import * as graphql from 'graphql'

import albumType from './type/album'
import gallery from '../service/gallery'

let queryType = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    albums: {
      type: new graphql.GraphQLList(albumType),
      args: {
        path: {
          type: graphql.GraphQLString
        }
      },
      async resolve (_, { path }) {
        return gallery.getAlbum(path)
      }
    }
  }
})

let schema = new graphql.GraphQLSchema({ query: queryType })
export default schema
