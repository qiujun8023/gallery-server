import Koa from 'koa'
import KoaRouter from 'koa-router'
import * as graphql from 'graphql'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'

import querySchema from '../schema/query'

const router = new KoaRouter()

let graphqlHander = graphqlKoa((ctx: Koa.Context) => ({
  schema: new graphql.GraphQLSchema({
    query: querySchema
  }),
  context: {
    session: ctx.session
  }
}))

let graphiqlHander = graphiqlKoa((ctx: Koa.Context) => ({
  endpointURL: '/graphql'
}))

router.get('/graphql', graphqlHander)
router.post('/graphql', graphqlHander)

router.get('/graphiql', graphiqlHander)

export default router
