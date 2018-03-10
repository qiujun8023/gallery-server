import KoaRouter from 'koa-router'
import * as graphql from 'graphql'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'

import querySchema from '../schema/query'

const router = new KoaRouter()

const schema = new graphql.GraphQLSchema({
  query: querySchema
})

router.get('/graphiql', graphiqlKoa({
  endpointURL: '/graphql'
}))
router.get('/graphql', graphqlKoa({ schema }))
router.post('/graphql', graphqlKoa({ schema }))

export default router
