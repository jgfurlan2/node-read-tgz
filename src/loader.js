import fs from 'node:fs'
import nodePath from 'node:path'
import Module from 'node:module'

import { modulesStore } from './modulesStore'

const { readFile, readFileSync } = fs

class PathNotFound extends Error {
  constructor(fileName, message = 'Path not found: {{fileName}}') {
    super(message.replace('{{fileName}}', fileName))
    this.name = 'PathNotFound'
  }
}

class IsNotFile extends Error {
  constructor(fileName, message = 'Path is not a file: {{fileName}}') {
    super(message.replace('{{fileName}}', fileName))
    this.name = 'IsNotFile'
  }
}

fs.readFile = function (path, options, callback) {
  path = nodePath.resolve(path)

  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  if (path.includes('.tar.gz')) {
    let relativePath = path.split('.tar.gz')[1].slice(1)
    if(relativePath.endsWith('package.json')) {
      relativePath = 'package.json'
    }

    console.log('[CUSTOM FILE SYSTEM READ FILE]', relativePath)

    const mod = modulesStore.getModule(relativePath)
    if (mod == null) {
      if (callback) callback(new PathNotFound(path))
      else throw new PathNotFound(path)
    } else if (mod.isDirectory) {
      if (callback) callback(new IsNotFile(path))
      else throw new IsNotFile(path)
    }

    if (callback) return callback(null, mod.data.toString(options.encoding ?? 'utf-8'))
    else return Promise.resolve(mod.data.toString(options.encoding ?? 'utf-8'))
  }

  return readFile(path, options, callback)
}

fs.readFileSync = function (path, options) {
  path = nodePath.resolve(path)

  if (path.includes('.tar.gz')) {
    let relativePath = path.split('.tar.gz')[1].slice(1)
    if(relativePath.endsWith('package.json')) {
      relativePath = 'package.json'
    }

    console.log('[CUSTOM FILE SYSTEM READ FILE SYNC]', relativePath)

    const mod = modulesStore.getModule(relativePath)
    if (mod == null) {
      throw new PathNotFound(path)
    } else if (mod.isDirectory) {
      throw new IsNotFile(path)
    }

    return mod.data.toString(options.encoding ?? 'utf-8')
  }

  return readFileSync(path, options)
}

const resolver = Module._resolveFilename
/**
 * @param {string} request
 * @param {import('node:module').Module} parent
 * @returns {string}
 */
Module._resolveFilename = function (request, parent) {
  if (request.startsWith('.')) {
    const absolutePath = nodePath.resolve(parent.path, request)

    if(absolutePath.includes('.tar.gz')) {
      return absolutePath
    }
  }

  return resolver(request, parent)
}