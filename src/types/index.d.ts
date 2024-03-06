declare interface StreamModule {
  path: string
  absolutePath: string
  lastUpdate: Date
  isFile: boolean
  isDirectory: boolean
  fileSize: number
  data: Buffer
}
