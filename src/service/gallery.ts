import config from 'config'

import { pathJoin, isHideFile, isImgFile } from '../lib/utils'
import upyun from './upyun'
import {
  AlbumConfig,
  GalleryType,
  GalleryItem,
  GalleryAlbum,
  GalleryImage,
  GalleryAlbumQuestions,
  GalleryAlbumsObject,
  UpYunFile,
  UpYunFileType,
  UpYunFileMeta
} from '../types'

export class Gallery {
  private config: GalleryAlbumsObject

  constructor (albumConfig: AlbumConfig) {
    this.config = this.loadConfig('/', albumConfig, {})
  }

  // 获取完整信息、包括子节点
  public async getAlbum (path: string): Promise<GalleryAlbum> {
    let album: GalleryAlbum = await this.getAlbumInfo(path)
    let items: GalleryItem[] = await this.getItems(path)

    // 删除空子图集
    items = items.filter((item): boolean => {
      if (item.type === GalleryType.ALBUM) {
        if (!(item as GalleryAlbum).thumbnails.length) {
          return false
        }
      }
      return true
    })

    return { ...album, items }
  }

  // 通过路径过去名称
  private getNameFromPath (path: string) {
    return path.split('/').pop() || path
  }

  // 加在配置文件
  private loadConfig (path: string, albumConfig: AlbumConfig, parentQuestions: object): GalleryAlbumsObject {
    // 生成相册问题
    let questions: GalleryAlbumQuestions = { ...parentQuestions }
    if (albumConfig.question && albumConfig.answer) {
      questions[albumConfig.question] = albumConfig.answer
    }

    let album: GalleryAlbum = {
      path: path,
      name: this.getNameFromPath(path),
      type: GalleryType.ALBUM,
      questions: questions,
      description: albumConfig.description || null,
      thumbnails: albumConfig.thumbnails || [],
      items: []
    }

    let albums = { path: album }
    if (albumConfig.items) {
      for (let itemPath in albumConfig.items) {
        let itemFullPath = pathJoin(path, itemPath)
        let childAlbums = this.loadConfig(itemFullPath, albumConfig.items[itemPath], album)
        Object.assign(albums, childAlbums)
      }
    }
    return albums
  }

  // 过滤非图片非文件夹
  private filterDirAndImgs (files: UpYunFile[]): UpYunFile[] {
    return files.filter((file: UpYunFile): boolean => {
      if (isHideFile(file.name)) {
        return false
      } else if (file.type === UpYunFileType.File) {
        if (!isImgFile(file.name)) {
          return false
        }
      }
      return true
    })
  }

  // 文件及文件夹排序，文件夹优先
  private sortFiles (files: UpYunFile[]): UpYunFile[] {
    files.sort((a: UpYunFile, b: UpYunFile): number => {
      if (a.type === UpYunFileType.Folder && b.type !== UpYunFileType.Folder) {
        return -1
      } else if (a.type !== UpYunFileType.Folder && b.type === UpYunFileType.Folder) {
        return 1
      }
      return a.name > b.name ? 1 : -1
    })
    return files
  }

  // 获取又拍云图片及图集列表
  private async getFiles (path: string): Promise<UpYunFile[]> {
    // 获取目录所有文件
    let files: UpYunFile[] = await upyun.listDirWithCache(path)

    // 过滤非空目录及图片并排序
    return this.sortFiles(this.filterDirAndImgs(files))
  }

  // 获取缩略图
  private async getThumbnails (path: string, thumbnails: string[] = []): Promise<string[]> {
    // 未设置缩略图则通过又拍云获取
    if (!thumbnails || !thumbnails.length) {
      let files: UpYunFile[] = await this.getFiles(path)
      for (let file of files) {
        if (file.type === UpYunFileType.File) {
          thumbnails.push(file.name)
        }
      }
    }

    // 最多获取四个缩略图
    thumbnails = thumbnails.slice(0, 4)
    for (let i = 0; i < thumbnails.length; i++) {
      let thumbnailPath = pathJoin(path, thumbnails[i])
      thumbnails[i] = upyun.getThumbnailUrl(thumbnailPath)
    }

    return thumbnails
  }

  // 获取图集信息
  private async getAlbumInfo (path: string): Promise<GalleryAlbum> {
    let album: GalleryAlbum = Object.assign({
      path,
      name: this.getNameFromPath(path),
      type: GalleryType.ALBUM,
      questions: {},
      description: null,
      thumbnails: [],
      items: []
    }, this.config[path] || {})

    album.thumbnails = await this.getThumbnails(path, album.thumbnails)
    return album
  }

  // 获取图片列表
  private async getImageInfo (path: string): Promise<GalleryImage> {
    let meta: UpYunFileMeta = await upyun.getMetaWithCache(path)
    return {
      path,
      name: this.getNameFromPath(path),
      type: GalleryType.IMAGE,
      meta,
      url: {
        original: upyun.getFileUrl(path),
        thumbnail: upyun.getThumbnailUrl(path)
      }
    }
  }

  // 获取子节点
  private async getItems (path: string): Promise<GalleryItem[]> {
    let files: UpYunFile[] = await this.getFiles(path)
    return Promise.all(
      files.map((item): Promise<GalleryItem> => {
        let itemPath: string = pathJoin(path, item.name)
        if (item.type === UpYunFileType.Folder) {
          return this.getAlbumInfo(itemPath)
        } else {
          return this.getImageInfo(itemPath)
        }
      }
    ))
  }
}

export default new Gallery(config.get('albums'))
