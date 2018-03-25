import schedule from 'node-schedule'

import logger from '../lib/logger'
import upyun from '../service/upyun'
import gallery from '../service/gallery'
import { GalleryImage, GalleryAlbum } from '../types'

let cacheAlbum = async (path: string): Promise<void> => {
  // 缓存子图集
  let albums: GalleryAlbum[] = await gallery.getAlbums(path, [])
  for (let album of albums) {
    await cacheAlbum(album.path)
  }

  // 缓存图片信息
  let images: GalleryImage[] = await gallery.getImages(path)
  for (let image of images) {
    await upyun.getMetaWithCache(image.path)
  }
}

export default new schedule.Job('cache', () => {
  cacheAlbum('/').catch((e) => logger.error(e))
})
