import { basename } from 'node:path'

export class FileReadError extends Error {
  constructor(path: string, options?: ErrorOptions) {
    // Redact absolute path to prevent host filesystem path leakage in error messages
    const redactedPath = basename(path)
    super(`Failed to read file: ${redactedPath}`, options)
    this.name = 'FileReadError'
  }
}
