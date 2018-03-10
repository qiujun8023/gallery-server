// 设置配置文件路径
process.env.NODE_CONFIG_DIR = 'src/config'

import config from 'config'

import app from './app'
import cron from './cron'
import logger from './lib/logger'
import { ServerConfig } from './types'

// 开启计划任务
cron.startAll()

// 启动 Web 服务
let serverConfig: ServerConfig = config.get('server')
app.listen(serverConfig.port, serverConfig.host, () => {
  logger.info('listen server at %s', serverConfig.baseUrl)
})
