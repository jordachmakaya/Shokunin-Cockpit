import { basename } from 'node:path'

export class FileReadError extends Error {
  constructor(path: string, options?: ErrorOptions) {
    // Redact absolute filesystem paths using basename to prevent sensitive path leak
    super(`Failed to read file: ${basename(path)}`, options)
    this.name = 'FileReadError'
  }
}
