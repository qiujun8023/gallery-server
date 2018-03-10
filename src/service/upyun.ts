import _ from 'lodash'
import rp from 'request-promise'
import config from 'config'
import upyun from 'upyun'

import redis from '../lib/redis'
import logger from '../lib/logger'
import { md5 } from '../lib/utils'
import { UpYunConfig, UpYunFile, UpYunFileMeta, UpYunAccessSign } from '../types'

class UpYun {
  private client: any

  private lastPageIter: string = 'g2gCZAAEbmV4dGQAA2VvZg'

  private minImageCacheTime: number = 300
  private maxImageCacheTime: number = 600
  private minMetaCacheTime: number = 43200
  private maxMateCacheTime: number = 86400

  private imageCacheKeyPrefix: string = 'image:'
  private metaCacheKeyPrefix: string = 'meta:'

  constructor (private upYunConfig: UpYunConfig) {
    let { bucket, operator, password } = upYunConfig
    let clientConfig = new upyun.Bucket(bucket, operator, password)
    this.client = new upyun.Client(clientConfig)
  }

  // 获取文件访问地址
  public getFileUrl (path: string): string {
    let { baseUrl, token } = this.upYunConfig

    let query = ''
    if (token) {
      query = '?_upt=' + this.getUpt(token, path)
    }

    path = path.split('/').map(encodeURIComponent).join('/')
    return _.trimEnd(baseUrl, '/') + path + query
  }

  // 获取缩略图地址
  public getThumbnailUrl (path: string): string {
    return this.getFileUrl(path + this.upYunConfig.makeThumbnail)
  }

  // 获取目录列表
  public async listDirWithCache (path: string): Promise<UpYunFile[]> {
    // 读取缓存
    let cacheKey: string = this.getImageCacheKey(path)
    let cacheData: string = await redis.get(cacheKey)
    if (cacheData) {
      return JSON.parse(cacheData)
    }

    // 通过upyun接口获取数据
    logger.info('request upyun to list dir: %s', path)
    let data: UpYunFile[] = await this.listDir(path)

    // 缓存数据
    let cacheTime: number = this.getImageCacheTime()
    logger.info('set list to cache, key: %s, ttl: ', cacheKey, cacheTime)
    await redis.setex(cacheKey, cacheTime, JSON.stringify(data))

    return data
  }

  // 获取图片元数据
  public async getMetaWithCache (path: string): Promise<UpYunFileMeta> {
    // 读取缓存
    let cacheKey: string = this.getMetaCacheKey(path)
    let cacheData: string = await redis.get(cacheKey)
    if (cacheData) {
      return JSON.parse(cacheData)
    }

    // 通过upyun接口获取数据
    logger.info('request upyun to fetch meta: %s', path)
    let meta = await this.getMeta(path)

    // 缓存数据
    let cacheTime: number = this.getMetaCacheTime()
    logger.info('set meta to cache, key: %s, ttl: ', cacheKey, cacheTime)
    await redis.setex(cacheKey, cacheTime, JSON.stringify(meta))

    return meta
  }

  // 获取访问签名
  private getAccessSign (token: string, path: string): UpYunAccessSign {
    let etime = Math.round(Date.now() / 1000) + 1800
    let sign = md5(`${token}&${etime}&${path}`).substr(12, 8)
    return { sign, etime }
  }

  // 获取 upt
  private getUpt (token: string, path: string): string {
    let accessSign: UpYunAccessSign = this.getAccessSign(token, path)
    return accessSign.sign + accessSign.etime
  }

  // 获取目录列表
  private async listDir (path: string): Promise<UpYunFile[]> {
    let iter: string | undefined
    let data: UpYunFile[] = []
    do {
      let options = { iter, limit: 1000 }
      let res = await this.client.listDir(path, options)
      if (res) {
        data = data.concat(res.files)
        iter = res.next
      }
    } while (iter && iter !== this.lastPageIter)

    return data
  }

  // 获取元数据
  private async getMeta (path: string): Promise<UpYunFileMeta> {
    return rp({
      url: this.getFileUrl(path + '!/meta'),
      json: true
    })
  }

  // 随机生成缓存时间
  private getRandomCacheTime (minTime: number, maxTime: number): number {
    return _.random(minTime, maxTime)
  }

  // 文件列表缓存时间
  private getImageCacheTime (): number {
    return this.getRandomCacheTime(this.minImageCacheTime, this.maxImageCacheTime)
  }

  // 元信息缓存时间
  private getMetaCacheTime (): number {
    return this.getRandomCacheTime(this.minMetaCacheTime, this.maxMateCacheTime)
  }

  private getCacheKey (prefix: string, path: string): string {
    return prefix + md5(path)
  }

  // 获取图片缓存key
  private getImageCacheKey (path: string): string {
    return this.getCacheKey(this.imageCacheKeyPrefix, path)
  }

  // 获取元信息缓存key
  private getMetaCacheKey (path: string): string {
    return this.getCacheKey(this.metaCacheKeyPrefix, path)
  }
}

export default new UpYun(config.get('upyun'))
