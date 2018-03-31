import Koa from 'koa'
import KoaRouter from 'koa-router'
import config from 'config'
import * as graphql from 'graphql'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'

import querySchema from '../schema/query'

const router = new KoaRouter({
  prefix: '/api'
})

let graphqlHander = graphqlKoa((ctx: Koa.Context) => ({
  schema: new graphql.GraphQLSchema({
    query: querySchema
  }),
  context: {
    session: ctx.session
  }
}))

router.get('/graphql', graphqlHander)
router.post('/graphql', graphqlHander)

if (config.get('debug')) {
  router.get('/graphiql', graphiqlKoa({
    endpointURL: '/api/graphql'
  }))
}

export default router
