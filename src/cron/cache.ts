import schedule from 'node-schedule'

import logger from '../lib/logger'
import gallery from '../service/gallery'
import { GalleryType } from '../types'

let cacheAlbum = async (path: string): Promise<void> => {
  let album = await gallery.getAlbum(path)
  if (album.items) {
    for (let item of album.items) {
      if (item.type === GalleryType.ALBUM) {
        await cacheAlbum(item.path)
      }
    }
  }
}

export default new schedule.Job('cache', () => {
  cacheAlbum('/').catch(logger.error)
})
