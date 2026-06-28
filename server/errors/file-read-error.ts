export class FileReadError extends Error {
  constructor(path: string, options?: ErrorOptions) {
    super(`Failed to read file: ${path}`, options)
    this.name = 'FileReadError'
  }
}
