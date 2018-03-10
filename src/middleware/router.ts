import KoaRouter from 'koa-router'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'

import schema from '../schema'

const router = new KoaRouter()

router.get('/graphiql', graphiqlKoa({
  endpointURL: '/graphql'
}))
router.get('/graphql', graphqlKoa({ schema }))
router.post('/graphql', graphqlKoa({ schema }))

export default router
