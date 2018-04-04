import crypto from 'crypto'

const imgExts: string[] = ['.png', '.jpg', '.jpeg', '.bmp', '.gif']

// md5
export function md5 (str: string): string {
  return crypto.createHash('md5').update(str).digest('hex')
}

// 路径拼接
export function pathJoin (...paths: string[]): string {
  return paths.join('/').replace(/\/{2,}/g, '/')
}

// 是否隐藏文件
export function isHideFile (fileName: string): boolean {
  return fileName.startsWith('.')

}

// 是否图片文件
export function isImgFile (fileName: string): boolean {
  let index: number = fileName.lastIndexOf('.')
  if (index !== -1) {
    let ext: string = fileName.substr(index)
    return imgExts.indexOf(ext.toLowerCase()) !== -1
  }
  return false
}
