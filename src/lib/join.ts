import { exists, findParts, joinFragments, removeFile, isFragment } from './utils'

export const join = (filePath: string, removeFragments = false) => {
  if (!exists(filePath)) {
    throw new Error('Input file does not exist')
  }
  if (!isFragment(filePath)) {
    throw new Error('Input file is not a fragment')
  }

  const parts = findParts(filePath)
  const outFile = filePath.replace(/\.\d{3}$/, '')

  if (parts.length < 1) {
    throw new Error('Partial files not found')
  }

  if (exists(outFile)) {
    throw new Error('Output file already exists')
  }

  joinFragments(parts, outFile)

  if (removeFragments) {
    parts.forEach(removeFile)
  }

  return outFile
}
