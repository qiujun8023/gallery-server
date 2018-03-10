import Koa from 'koa'
import koaBody from 'koa-bodyparser'
import config from 'config'

import router from './middleware/router'

const app = new Koa()

app.keys = config.get('keys')

app.use(koaBody())

app.use(router.routes())
app.use(router.allowedMethods())

export default app
