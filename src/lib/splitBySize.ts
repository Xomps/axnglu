import { parseSize, getFileSize, writePart, removeFile, exists } from './utils'

export const splitBySize = async (filePath: string, size: number | string, removeOriginalFile: boolean = false): Promise<string[]> => {
  if (!exists(filePath)) {
    throw new Error('Input file does not exist')
  }

  const partFiles = []
  const partSize = parseSize(size)

  if (partSize === 0) {
    throw new Error('Really? Zero size?')
  }

  const fileSize = getFileSize(filePath)
  const totalParts = Math.ceil(fileSize / partSize)
  const parts = []

  if (totalParts === 1) {
    throw new Error('Part size is bigger or equial than the original file size')
  }

  while (parts.length < totalParts) {
    parts.push({
      filePath: `${filePath}.${String(parts.length + 1).padStart(3, '0')}`,
      start: parts.length * partSize,
      end: Math.min((parts.length + 1) * partSize, fileSize) - 1
    })
  }
  for (const partInfo of parts) {
    partFiles.push(await writePart(filePath, partInfo))
  }
  if (removeOriginalFile) {
    removeFile(filePath)
  }

  return partFiles
}
