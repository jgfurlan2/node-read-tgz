import './loader'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import tarStream from 'tar-stream'

import { modulesStore } from './modulesStore'

async function readFile(entry: tarStream.Entry): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = []

    entry.on('error', (error) => {
      reject(error)
    })

    entry.on('data', (chunk) => {
      chunks.push(chunk)
    })

    entry.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
  })
}

async function processTarGzip(filePath: string): Promise<void> {
  const gzip = zlib.createGunzip()
  const extract = tarStream.extract()

  fs.createReadStream(filePath).pipe(gzip).pipe(extract)
  for await (const entry of extract) {
    const header = entry.header
    const relativePath = path.normalize(header.type === 'directory' ? header.name.slice(0, -1) : header.name)
    const module: StreamModule = {
      absolutePath: path.resolve(filePath, relativePath),
      path: relativePath,
      lastUpdate: header.mtime,
      isDirectory: header.type === 'directory',
      isFile: header.type === 'file',
      fileSize: null,
      data: null
    }

    if (module.isFile) {
      const buffer: Buffer = await readFile(entry)
      module.fileSize = header.size
      module.data = buffer
    }

    modulesStore.addModule(module)
  }
}

async function main(): Promise<void> {
  const tgzFilePath = path.resolve(__dirname, '..', 'archive.tar.gz')
  if (!fs.existsSync(tgzFilePath)) {
    throw new Error('Create .tar.gz file before with "yarn tgz:create"!')
  }

  await processTarGzip()
  console.log(modulesStore.modules)

  const handler = require('../archive.tar.gz/dist/index.js')
  handler()
}

main()
