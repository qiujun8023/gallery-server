export interface ServerConfig {
  host: string
  port: number
  baseUrl: string
  title: string
}

export interface RedisConfig {
  host: string
  port: number
  keyPrefix: string
}

export interface UpYunConfig {
  bucket: string
  operator: string
  password: string
  token: string
  makeThumbnail: string
  baseUrl: string
}

export interface AlbumConfig {
  name?: string
  question?: string
  answer?: string
  description?: string
  thumbnails?: string[]
  items?: AlbumsConfig
}

export interface AlbumsConfig {
  [path: string]: AlbumConfig
}

export interface UpYunAccessSign {
  sign: string
  etime: number
}

export enum UpYunFileType {
  File = 'N',
  Folder = 'F'
}

export interface UpYunFile {
  name: string
  type: UpYunFileType
  size: number
  time: number
}

export interface UpYunFileMeta {
  width: number
  height: number
  frames: number
  type: string
  EXIF: object
}

export interface GalleryImage {
  path: string
  name: string
}

export interface GalleryAlbumQuestions {
  [path: string]: {
    question: string,
    answer: string
  }
}

export interface GalleryAlbum {
  path: string
  name: string
  description: string | null
  questions: GalleryAlbumQuestions
  thumbnails?: string[]
}

export interface GalleryAlbumsObject {
  [path: string]: GalleryAlbum
}

export interface InputAnswer {
  path: string,
  answer: string
}

export interface OutputQuestion {
  path: string,
  question: string
}

export interface OutputAnswer {
  allowed: string[]
}

export interface OutputServer {
  title: string
}
