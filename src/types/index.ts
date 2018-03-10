export interface ServerConfig {
  host: string,
  port: number,
  baseUrl: string,
  title: string
}

export interface RedisConfig {
  host: string,
  port: number,
  keyPrefix: string
}

export interface UpYunConfig {
  bucket: string,
  operator: string,
  password: string,
  token: string,
  makeThumbnail: string,
  baseUrl: string
}

export interface AlbumConfig {
  name?: string
  question?: string
  answer?: string
  description?: string
  thumbnails?: string[]
  items?: {
    [path: string]: AlbumConfig
  }
}

export interface UpYunAccessSign {
  sign: string,
  etime: number
}

export enum UpYunFileType {
  File = 'N',
  Folder = 'F'
}

export interface UpYunFile {
  name: string,
  type: UpYunFileType,
  size: number,
  time: number
}

export interface UpYunFileMeta {
  width: number,
  height: number,
  frames: number,
  type: string
  EXIF: object
}

export enum GalleryType {
  IMAGE = 'IMAGE',
  ALBUM = 'ALBUM'
}

export interface GalleryItem {
  type: GalleryType
  path: string
  name: string
}

export interface GalleryImage extends GalleryItem {
  type: GalleryType.IMAGE
  meta: UpYunFileMeta
  url: {
    original: string,
    thumbnail: string
  }
}

export interface GalleryAlbumQuestions {
  [question: string]: string
}

export interface GalleryAlbum extends GalleryItem {
  type: GalleryType.ALBUM
  questions: GalleryAlbumQuestions
  description: string | null
  thumbnails: string[]
  items: GalleryItem[]
}

export interface GalleryAlbumsObject {
  [path: string]: GalleryAlbum
}
