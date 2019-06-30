import { getFileSize, exists } from './utils'
import { splitBySize } from './splitBySize'

export const splitByParts = (filePath: string, parts: number, removeOriginalFile = false): Promise<string[]> => {
  if (!exists(filePath)) {
    throw new Error('Input file does not exist')
  }

  if (parts < 2 || parts > 999) {
    throw new Error('Number of parts must be between 1 and 1000')
  }

  const fileSize = getFileSize(filePath)
  const partSize = Math.ceil(fileSize / parts)

  return splitBySize(filePath, partSize, removeOriginalFile)
}
