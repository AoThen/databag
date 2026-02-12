import { Staging } from 'databag-client-sdk'

const CHUNK_SIZE = 1048576; // 1MB chunks for streaming

export class StagingFiles implements Staging {
  public async clear(): Promise<void> {}

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  public async read(source: File): Promise<{ size: number; getData: (position: number, length: number) => Promise<string>; close: () => Promise<void> }> {
    const size = source.size

    // Stream-based file reading - chunks loaded on demand
    const getData = async (position: number, length: number) => {
      if (position + length > size) {
        throw new Error('invalid read request')
      }

      // Read only the requested chunk, not the entire file
      const blob = source.slice(position, position + length)
      return await this.blobToBase64(blob)
    }

    const close = async () => {}

    return { size, getData, close }
  }

  public async write(): Promise<{ 
    setData: (data: string, progress?: (loaded: number, total: number) => void) => Promise<void>; 
    getUrl: () => Promise<string>; 
    close: () => Promise<void> 
    }> {
    const chunks: Uint8Array[] = []
    let totalSize = 0
    let url: string | null = null

    const setData = async (data: string, progress?: (loaded: number, total: number) => void): Promise<void> => {
      const block = this.base64ToUint8Array(data)
      chunks.push(block)
      totalSize += block.byteLength

      // Report progress if callback provided
      if (progress) {
        // In streaming mode, we might not know total size upfront
        progress(totalSize, totalSize)
      }
    }

    const getUrl = async () => {
      if (url) {
        return url
      }

      // Create blob from chunks - only done once when URL is requested
      const blob = new Blob(chunks)
      url = URL.createObjectURL(blob)
      return url
    }

    const close = async () => {
      if (url) {
        URL.revokeObjectURL(url)
        url = null
      }
      // Clear chunks from memory
      chunks.length = 0
      totalSize = 0
    }

    return { setData, getUrl, close }
  }

  // Stream-based upload helper for large files
  public async uploadStreaming(
    source: File,
    uploadChunk: (chunk: ArrayBuffer, chunkIndex: number, totalChunks: number) => Promise<void>,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<void> {
    const totalSize = source.size
    const totalChunks = Math.ceil(totalSize / CHUNK_SIZE)

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, totalSize)
      const blob = source.slice(start, end)

      // Convert chunk to ArrayBuffer and upload
      const arrayBuffer = await this.blobToArrayBuffer(blob)
      await uploadChunk(arrayBuffer, chunkIndex, totalChunks)

      // Report progress
      if (onProgress) {
        onProgress(end, totalSize)
      }
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        if (dataUrl && typeof dataUrl === 'string' && dataUrl.includes(',')) {
          resolve(dataUrl.split(',')[1])
        } else if (dataUrl) {
          resolve(dataUrl)
        } else {
          reject(new Error('Failed to convert blob to base64'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  private async blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = reject
      reader.readAsArrayBuffer(blob)
    })
  }

  // Legacy compatibility: load full file data (deprecated, use streaming instead)
  private async loadFullFileData(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as ArrayBuffer)
      }
      reader.readAsArrayBuffer(file)
    })
  }
}
