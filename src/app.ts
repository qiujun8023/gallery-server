import Koa from 'koa'
import koaBody from 'koa-bodyparser'
import config from 'config'

import router from './middleware/router'
import session from './middleware/session'

const app = new Koa()

app.keys = config.get('keys')

app.use(koaBody())

app.use(session())

app.use(router.routes())
app.use(router.allowedMethods())

export default app
