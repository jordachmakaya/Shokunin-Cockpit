import { basename } from 'node:path'

export class FileReadError extends Error {
  constructor(path: string, options?: ErrorOptions) {
    // Redact absolute path to prevent leaking filesystem structure
    super(`Failed to read file: ${basename(path)}`, options)
    this.name = 'FileReadError'
  }
}
