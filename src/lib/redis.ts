import config from 'config'
import Redis from 'ioredis'

import { RedisConfig } from '../types'

let redisConfig: RedisConfig = config.get('redis')
export default new Redis(redisConfig)
